import { generateApolloClient } from '@deepcase/hasura/client';
import Debug from 'debug';
import { up as upTable, down as downTable } from '@deepcase/materialized-path/table';
import { up as upRels, down as downRels } from '@deepcase/materialized-path/relationships';
import { Trigger } from '@deepcase/materialized-path/trigger';
import { api, SCHEMA, TABLE_NAME as LINKS_TABLE_NAME } from './1616701513782-links';
import { MP_TABLE_NAME } from './1621815803572-materialized-path';
import { generatePermissionWhere, permissions } from '../imports/permission';
import { sql } from '@deepcase/hasura/sql';

const debug = Debug('deepcase:deeplinks:migrations:up-down');

export const up = async () => {
  debug('up');
  await api.sql(sql`CREATE OR REPLACE FUNCTION ${LINKS_TABLE_NAME}__down_links__function(link ${LINKS_TABLE_NAME}, tree bigint)
    RETURNS SETOF ${LINKS_TABLE_NAME}
    LANGUAGE sql
    STABLE
  AS $function$
    SELECT ${LINKS_TABLE_NAME}.*
    FROM ${LINKS_TABLE_NAME}, ${MP_TABLE_NAME}
    WHERE
    ${MP_TABLE_NAME}.group_id = tree AND
    ${MP_TABLE_NAME}.path_item_id = link.id AND
    ${LINKS_TABLE_NAME}.id = ${MP_TABLE_NAME}.item_id
  $function$;`);
  await api.sql(sql`CREATE OR REPLACE FUNCTION ${LINKS_TABLE_NAME}__up_links__function(link ${LINKS_TABLE_NAME}, tree bigint)
    RETURNS SETOF ${LINKS_TABLE_NAME}
    LANGUAGE sql
    STABLE
  AS $function$
    SELECT ${LINKS_TABLE_NAME}.*
    FROM ${LINKS_TABLE_NAME}, ${MP_TABLE_NAME}
    WHERE
    ${MP_TABLE_NAME}.group_id = tree AND
    ${MP_TABLE_NAME}.item_id = link.id AND
    ${LINKS_TABLE_NAME}.id = ${MP_TABLE_NAME}.path_item_id
  $function$;`);
  await api.query({
    type: 'add_computed_field',
    args: {
      table: LINKS_TABLE_NAME,
      source: 'default',
      name: 'down',
      definition:{
        function:{
            name: `${LINKS_TABLE_NAME}__down_links__function`,
            schema: 'public',
        },
        table_argument: 'link',
      }
    },
  });
  await api.query({
    type: 'add_computed_field',
    args: {
      table: LINKS_TABLE_NAME,
      source: 'default',
      name: 'up',
      definition:{
        function:{
            name: `${LINKS_TABLE_NAME}__up_links__function`,
            schema: 'public',
        },
        table_argument: 'link',
      }
    },
  });
};

export const down = async () => {
  debug('down');
  await api.query({
    type: 'drop_computed_field',
    args: {
      table: LINKS_TABLE_NAME,
      source: 'default',
      name: 'down',
      cascade: false,
    },
  });
  await api.query({
    type: 'drop_computed_field',
    args: {
      table: LINKS_TABLE_NAME,
      source: 'default',
      name: 'up',
      cascade: false,
    },
  });
  await api.sql(sql`DROP FUNCTION IF EXISTS ${LINKS_TABLE_NAME}__down_links__function;`);
  await api.sql(sql`DROP FUNCTION IF EXISTS ${LINKS_TABLE_NAME}__up_links__function;`);
};
