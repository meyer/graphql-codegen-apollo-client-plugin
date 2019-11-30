import * as pluginHelpers from '@graphql-codegen/plugin-helpers';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { Kind, concatAST, visit, FragmentDefinitionNode, DocumentNode } from 'graphql';
import * as path from 'path';
import { ReactApolloVisitor } from './visitor';

export interface ReactApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  apolloClientPath: string;
}

const isString = (str: any): str is string => typeof str === 'string';
const isFragment = (node: any): node is FragmentDefinitionNode => node.kind === Kind.FRAGMENT_DEFINITION;

export const plugin: pluginHelpers.PluginFunction<ReactApolloRawPluginConfig> = (schema, documents, config) => {
  const allAst = concatAST(documents.reduce<DocumentNode[]>((prev, v) => [...prev, v.content], []));

  const allFragments: LoadedFragment[] = [
    ...allAst.definitions.filter(isFragment).map(fragmentDef => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false
    })),
    ...(config.externalFragments || [])
  ];

  const visitor = new ReactApolloVisitor(schema, allFragments, config);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: ['/* eslint-disable */', ...visitor.getImports()],
    content: [visitor.fragments, ...visitorResult.definitions.filter(isString)].join('\n')
  };
};

export const validate: pluginHelpers.PluginValidateFn<ReactApolloRawPluginConfig> = (
  _schema,
  _documents,
  config,
  outputFile
) => {
  if (!config.apolloClientPath) {
    throw new Error('`apolloClientPath` is a required config option');
  }

  if (typeof config.apolloClientPath !== 'string' || !config.apolloClientPath.includes('#')) {
    throw new Error('`apolloClientPath` must be a string in the format of `./path/to/client#exportName`');
  }

  if (path.extname(outputFile) !== '.ts' && path.extname(outputFile) !== '.tsx') {
    throw new Error('Output filename should end with `.ts` or `.tsx`');
  }
};
