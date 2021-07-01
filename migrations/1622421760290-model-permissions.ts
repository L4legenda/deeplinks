import { sql } from '@deepcase/hasura/sql';
import Debug from 'debug';
import { generateDown, generateUp } from '../imports/type-table';
import { api, SCHEMA, TABLE_NAME as LINKS_TABLE_NAME } from './1616701513782-links';
import { TABLE_NAME as BOOL_EXP_TABLE_NAME } from './1616701513790-type-table-bool-exp';

const debug = Debug('deepcase:deepgraph:migrations:model-permissions');

export const TABLE_NAME = 'dc_dg_links';
export const REPLACE_PATTERN_ID = '777777777777';

export const up = async () => {
  debug('up');
  debug('insert');
  await api.sql(sql`
    CREATE OR REPLACE FUNCTION public.${TABLE_NAME}__model_permissions__insert_links__function()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
      DECLARE
        boolExp RECORD;
        sqlResult INT;
      BEGIN
        SELECT * into boolExp from "${BOOL_EXP_TABLE_NAME}" where link_id = NEW.type_id;
        IF boolExp IS NOT NULL THEN
          EXECUTE (SELECT REPLACE(boolExp.sql, '${REPLACE_PATTERN_ID}', NEW.id::text)) INTO sqlResult;
          IF sqlResult = 0 THEN
            RAISE EXCEPTION 'dc dg mp reject insert because bool_exp: % gql: %', boolExp.id, boolExp.gql;
          END IF;
        END IF;
        RETURN NEW;
      END;
    $function$;
    CREATE TRIGGER ${TABLE_NAME}__model_permissions__insert_links__trigger AFTER INSERT ON "${TABLE_NAME}" FOR EACH ROW EXECUTE PROCEDURE ${TABLE_NAME}__model_permissions__insert_links__function();
  `);
  debug('delete');
  await api.sql(sql`
    CREATE OR REPLACE FUNCTION public.${TABLE_NAME}__model_permissions__delete_links__function()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
      DECLARE
        boolExp RECORD;
        sqlResult INT;
      BEGIN
        SELECT * into boolExp from "${BOOL_EXP_TABLE_NAME}" where link_id = NEW.type_id;
        IF boolExp IS NOT NULL THEN
          EXECUTE (SELECT REPLACE(boolExp.sql, '${REPLACE_PATTERN_ID}', NEW.id::text)) INTO sqlResult;
          IF sqlResult = 0 THEN
            RAISE EXCEPTION 'dc dg mp reject delete because bool_exp: % gql: %', boolExp.id, boolExp.gql;
          END IF;
        END IF;
        RETURN OLD;
      END;
    $function$;
    CREATE TRIGGER ${TABLE_NAME}__model_permissions__delete_links__trigger BEFORE DELETE ON "${TABLE_NAME}" FOR EACH ROW EXECUTE PROCEDURE ${TABLE_NAME}__model_permissions__delete_links__function();
  `);
};

export const down = async () => {
  debug('down');
  debug('insert');
  await api.sql(sql`
    DROP FUNCTION IF EXISTS ${TABLE_NAME}__model_permissions__insert_links__function();
    DROP TRIGGER IF EXISTS ${TABLE_NAME}__model_permissions__insert_links__trigger;
  `);
  debug('delete');
  await api.sql(sql`
    DROP FUNCTION IF EXISTS ${TABLE_NAME}__model_permissions__delete_links__function();
    DROP TRIGGER IF EXISTS ${TABLE_NAME}__model_permissions__delete_links__trigger;
  `);
};