import * as OpenApi from "schema-openapi";

import * as S from "@effect/schema/Schema";

import { EndpointSchemasToInput } from "./internal";

const fillDefaultSchemas = <I extends InputSchemas>({
  response,
  query,
  params,
  body,
}: I): ComputeEndpoint<string, I>["schemas"] => ({
  response,
  query: (query ?? IgnoredSchemaId) as ComputeEndpoint<
    string,
    I
  >["schemas"]["query"],
  params:
    params ??
    (IgnoredSchemaId as ComputeEndpoint<string, I>["schemas"]["params"]),
  body:
    body ?? (IgnoredSchemaId as ComputeEndpoint<string, I>["schemas"]["body"]),
});

export const IgnoredSchemaId = Symbol("effect-http/ignore-schema-id");
export type IgnoredSchemaId = typeof IgnoredSchemaId;

export interface Endpoint<
  Id extends string = string,
  Query = any,
  Params = any,
  Body = any,
  Response = any,
> {
  id: Id;
  path: string;
  method: OpenApi.OpenAPISpecMethodName;
  schemas: {
    query: Query;
    params: Params;
    body: Body;
    response: S.Schema<Response>;
  };
}

export type Api<E extends Endpoint[] = Endpoint[]> = E;

export type InputSchemas<
  QueryS = any,
  ParamsS = any,
  BodyS = any,
  Response = any,
> = {
  response: S.Schema<Response>;
  query?: QueryS;
  params?: ParamsS;
  body?: BodyS;
};

export type ComputeEndpoint<
  Id extends string,
  I extends InputSchemas,
> = S.Spread<
  Endpoint<
    Id,
    I["query"] extends S.Schema<any> ? I["query"] : IgnoredSchemaId,
    I["params"] extends S.Schema<any> ? I["params"] : IgnoredSchemaId,
    I["body"] extends S.Schema<any> ? I["body"] : IgnoredSchemaId,
    S.To<I["response"]>
  >
>;

export const api = (): Api<[]> => [];

export const endpoint =
  (method: OpenApi.OpenAPISpecMethodName) =>
  <const Id extends string, const I extends InputSchemas>(
    id: Id,
    path: string,
    schemas: I,
  ) =>
  <A extends Endpoint[]>(self: Api<A>): Api<[...A, ComputeEndpoint<Id, I>]> =>
    [
      ...self,
      {
        schemas: fillDefaultSchemas(schemas),
        id,
        path,
        method,
      } as ComputeEndpoint<Id, I>,
    ];

export const get = endpoint("get");
export const post = endpoint("post");
export const put = endpoint("put");
export const head = endpoint("head");
export const patch = endpoint("patch");
export const trace = endpoint("trace");
export const _delete = endpoint("delete");
export { _delete as delete };
export const options = endpoint("options");
