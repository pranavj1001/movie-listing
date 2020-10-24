const DATABASE_INIT_TABLE_CODE = `
CREATE TABLE IF NOT EXISTS movies (
	id UUID, 
	name TEXT,
	director TEXT,
	popularity INTEGER,
	score NUMERIC,
	createddate TIMESTAMP WITH TIME ZONE,
	lastmodifieddate TIMESTAMP WITH TIME ZONE, 
	createdby TEXT,
	lastmodifiedby TEXT,
	createdbygoogleuserid TEXT,
	isactive BOOLEAN,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS genres (
	id UUID, 
	name TEXT,
	PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS movies_genres_mapping (
	id UUID,
	movieid UUID,
	genreid UUID,
	PRIMARY KEY(id),
	CONSTRAINT fk_movieid FOREIGN KEY(movieid) REFERENCES movies(id),
	CONSTRAINT fk_genreid FOREIGN KEY(genreid) REFERENCES genres(id)
);
`;

const DATABASE_INIT_FUNCTION_CODE = `
CREATE OR REPLACE FUNCTION public.save_movie(
	par_movieid uuid DEFAULT NULL::uuid,
	par_moviename text DEFAULT NULL::text,
	par_director text DEFAULT NULL::text,
	par_popularity integer DEFAULT NULL::integer,
	par_score numeric DEFAULT NULL::numeric,
	par_createdby text DEFAULT NULL::text,
	par_lastmodifiedby text DEFAULT NULL::text,
	par_createdbygoogleuserid text DEFAULT NULL::text,
	par_genrelist text[] DEFAULT NULL::text[]
)
    RETURNS json
    LANGUAGE 'plpgsql'

AS $BODY$
DECLARE
var_data json;
var_statuscode int;
var_error text;
var_genreid uuid;
var_genre text;
BEGIN
	var_error := '';
	BEGIN
		IF EXISTS (SELECT id, isactive FROM movies WHERE id = par_movieid AND isactive = true) THEN
			UPDATE 
				movies
			SET
				director = par_director,
				popularity = par_popularity,
				score = par_score,
				lastmodifieddate = (select now()),
				lastmodifiedby = par_lastmodifiedby
			WHERE
				id = par_movieid;
			var_statuscode := 0;
			var_data := json_build_object('msg', 'Movie updated.', 'movieid', par_movieid);
		ELSE
			par_movieid := uuid_generate_v4();
			INSERT INTO 
				movies (
					id, 
					name, 
					director, 
					popularity, 
					score, 
					createddate, 
					lastmodifieddate, 
					createdby, 
					lastmodifiedby, 
					createdbygoogleuserid, 
					isactive) 
			VALUES
				(par_movieid, 
				 par_moviename, 
				 par_director,
				 par_popularity,
				 par_score,
				 (select now()),
				 (select now()),
				 par_createdby,
				 par_createdby,
				 par_createdbygoogleuserid,
				 true);
			var_statuscode := 0;
			var_data := json_build_object('msg', 'New Movie inserted.', 'movieid', par_movieid);
		END IF;

		EXCEPTION WHEN others THEN
			RAISE NOTICE '% %', SQLERRM, SQLSTATE;
			var_statuscode := 1;
			var_error := 'Some error occurred while saving the Movie. ' || SQLERRM;
			var_data := json_build_object('msg', 'Some error occurred while saving the Movie.', 'movieid', NULL);
	END;
	BEGIN
	
		IF EXISTS (SELECT id FROM movies_genres_mapping WHERE movieid = par_movieid) THEN
			DELETE FROM movies_genres_mapping WHERE movieid = par_movieid;
		END IF;
	
		FOREACH var_genre IN ARRAY par_genrelist
		LOOP
			SELECT
				id
			INTO
				var_genreid
			FROM
				genres
			WHERE
				lower(var_genre) = lower(name);
			
		
			IF var_genreid IS NULL THEN
				var_genreid := uuid_generate_v4();
				INSERT INTO
					genres(id, name)
				VALUES
					(var_genreid,
					 var_genre);
			END IF;
			
			INSERT INTO
				movies_genres_mapping(id, movieid, genreid)
			VALUES
				(uuid_generate_v4(),
				 par_movieid,
				 var_genreid);
		END LOOP;
	
		EXCEPTION WHEN others THEN
			RAISE NOTICE '% %', SQLERRM, SQLSTATE;
			var_statuscode := 1;
			var_error := 'Some error occurred while saving the Movie Genres. ' || SQLERRM;
			var_data := json_build_object('msg', 'Some error occurred while saving the Movie Genres.', 'movieid', NULL);
	END;
	
	RETURN json_build_object(
		'status', var_statuscode,
		'data', var_data,
		'error', var_error
	);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.delete_movie(
	par_movieid uuid DEFAULT NULL::uuid
)
    RETURNS json
    LANGUAGE 'plpgsql'

AS $BODY$
DECLARE
var_data json;
var_statuscode int;
var_error text;
BEGIN
	var_error := '';
	BEGIN
		IF EXISTS (SELECT id, isactive FROM movies WHERE id = par_movieid AND isactive = true) THEN
			UPDATE 
				movies
			SET
				isactive = false
			WHERE
				id = par_movieid;
			var_statuscode := 0;
			var_data := json_build_object('msg', 'Movie deleted.', 'movieid', par_movieid);
		ELSE
			var_statuscode := 1;
			var_data := json_build_object('msg', 'No such movie in database.', 'movieid', par_movieid);
		END IF;

		EXCEPTION WHEN others THEN
			RAISE NOTICE '% %', SQLERRM, SQLSTATE;
			var_statuscode := 1;
			var_error := 'Some error occurred while deleting the Movie. ' || SQLERRM;
			var_data := json_build_object('msg', 'Some error occurred while deleting the Movie.', 'movieid', NULL);
	END;
	
	RETURN json_build_object(
		'status', var_statuscode,
		'data', var_data,
		'error', var_error
	);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.search_movies(
	par_searchtext text DEFAULT NULL::text,
	par_sortby text DEFAULT NULL::text,
	par_sortorder text DEFAULT NULL::text,
	par_genrelist uuid[] DEFAULT NULL::uuid[],
	par_pagesize INTEGER DEFAULT 25,
	par_pagenumber INTEGER DEFAULT 1
)
    RETURNS json
    LANGUAGE 'plpgsql'

AS $BODY$
DECLARE
var_data json;
var_statuscode int;
var_error text;
var_query text;
BEGIN
	var_error := '';
	BEGIN
	
		DROP TABLE IF EXISTS temp_search_results;
		CREATE TEMPORARY TABLE temp_search_results
		(
			id UUID, 
			name TEXT,
			director TEXT,
			popularity INTEGER,
			score NUMERIC,
			createddate TIMESTAMP WITH TIME ZONE,
			lastmodifieddate TIMESTAMP WITH TIME ZONE, 
			createdby TEXT,
			lastmodifiedby TEXT,
			createdbygoogleuserid TEXT
		);
		
		par_searchtext := lower(par_searchtext);

		var_query := '
		INSERT INTO 
			temp_search_results(
				id,
				name,
				director,
				popularity,
				score,
				createddate,
				lastmodifieddate,
				createdby,
				lastmodifiedby,
				createdbygoogleuserid
			)
			SELECT
				m.id,
				m.name,
				m.director,
				m.popularity,
				m.score,
				m.createddate,
				m.lastmodifieddate,
				m.createdby,
				m.lastmodifiedby,
				m.createdbygoogleuserid	
			FROM
				movies m
			WHERE
				(lower(m.name) like ''%' || par_searchtext || '%''
				OR
				lower(m.director) like ''%' || par_searchtext || '%'')
				AND m.isactive = true
			ORDER BY
				m.' || par_sortby || ' '  || par_sortorder || '
			LIMIT
				' || par_pagesize || ' 
			OFFSET
				' || par_pagesize * (par_pagenumber - 1);

		EXECUTE var_query;
		
		var_data := (
			SELECT json_agg(t1) FROM (
				SELECT
					DISTINCT(tsr.id),
					tsr.name,
					tsr.director,
					tsr.popularity
				FROM
					temp_search_results tsr
				INNER JOIN
					movies_genres_mapping mgp
				ON
					mgp.movieid = tsr.id
				INNER JOIN
					genres g
				ON
					g.id = mgp.genreid
					AND
					g.id = ANY(par_genrelist)
			) t1)::json;
		
		var_statuscode := 0;

		EXCEPTION WHEN others THEN
			RAISE NOTICE '% %', SQLERRM, SQLSTATE;
			var_statuscode := 1;
			var_error := 'Some error occurred while searching for the Movie. ' || SQLERRM;
			var_data := json_build_object('msg', 'Some error occurred while searching for the Movie.', 'movieid', NULL);
	END;
	
	RETURN json_build_object(
		'status', var_statuscode,
		'data', var_data,
		'error', var_error
	);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.get_movie(
	par_movieid uuid DEFAULT NULL::uuid
)
    RETURNS json
    LANGUAGE 'plpgsql'

AS $BODY$
DECLARE
var_data json;
var_statuscode int;
var_error text;
BEGIN
	var_error := '';
	BEGIN
		
		IF EXISTS (SELECT id FROM movies WHERE id = par_movieid AND isactive = true) THEN
			var_data := 
				(SELECT json_agg(t1) FROM (
					SELECT
						*
					FROM
						movies
					WHERE
						id = par_movieid
				) t1)::json;
			var_statuscode := 0;
		ELSE
			var_statuscode := 1;
			var_data := json_build_object('msg', 'No such movie in database.', 'movieid', par_movieid);
		END IF;

		EXCEPTION WHEN others THEN
			RAISE NOTICE '% %', SQLERRM, SQLSTATE;
			var_statuscode := 1;
			var_error := 'Some error occurred while fetching details for the Movie. ' || SQLERRM;
			var_data := json_build_object('msg', 'Some error occurred while fetching details for the Movie.', 'movieid', NULL);
	END;
	
	RETURN json_build_object(
		'status', var_statuscode,
		'data', var_data,
		'error', var_error
	);
END;
$BODY$;
`;


module.exports = {
    PG_DB_INIT_TABLE: DATABASE_INIT_TABLE_CODE,
    PG_DB_INIT_FUNCTION: DATABASE_INIT_FUNCTION_CODE,
    LOST_PG_CONNECTION_MESSAGE: 'Lost PG Connection.',
    LISTENING_ON_PORT_MESSAGE: 'Listening on port number 5000',
    CREATE_UUID_OOSP: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'
};