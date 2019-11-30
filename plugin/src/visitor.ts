import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  LoadedFragment
} from '@graphql-codegen/visitor-plugin-common';
import { lowerCaseFirst } from 'change-case';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { ReactApolloRawPluginConfig } from './plugin';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: ReactApolloRawPluginConfig,
    additionalConfig: Partial<ReactApolloPluginConfig> = {}
  ) {
    super(schema, fragments, rawConfig, additionalConfig);

    const bits = rawConfig.apolloClientPath.split('#');

    this.apolloClientPath = bits[0];
    this.apolloClientImportName = bits[1];
  }

  private apolloClientPath: string;
  private apolloClientImportName: string;

  private imports = new Set<string>();
  private importSetup = new Set<string>();
  private apolloTypeImports = new Set<string>();

  public getImports = (): string[] => {
    const baseImports = super.getImports();

    if (this._collectedOperations.length === 0) {
      return baseImports;
    }

    const imports = Array.from(this.apolloTypeImports).sort();

    if (imports.length > 0) {
      this.imports.add(`import { ${imports.join(', ')} } from 'apollo-client';`);
    }

    this.importSetup.add(`import { ${this.apolloClientImportName} } from "${this.apolloClientPath}";`);

    return [...baseImports, ...Array.from(this.imports), ...Array.from(this.importSetup)];
  };

  protected buildOperation = (
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string => {
    if (!node.name?.value) {
      throw new Error('All queries and mutations need explicit names');
    }

    let op: 'query' | 'mutate';
    if (node.operation === 'query') {
      op = 'query';
    } else if (node.operation === 'mutation') {
      op = 'mutate';
    } else {
      throw new Error('Unsupported operation type: ' + node.operation);
    }

    const operationName: string = lowerCaseFirst(
      this.convertName(node.name.value, {
        suffix: '',
        useTypesPrefix: false
      })
    );

    const optionTypeName = `${operationType}Options`;
    const optionTypeVariables = (op === 'mutate' ? `${operationResultType}, ` : '') + operationVariablesTypes;
    const optionType = `${optionTypeName}<${optionTypeVariables}>`;

    this.apolloTypeImports.add(optionTypeName);

    const omittedOptionType = `Omit<${optionType}, '${node.operation}' | 'variables'>`;

    if (node.variableDefinitions?.length === 0) {
      return `
export const ${operationName} = (options?: ${omittedOptionType}) => {
  return ${this.apolloClientImportName}.${op}<${operationResultType}, ${operationVariablesTypes}>({
    ...options,
    ${node.operation}: ${documentVariableName},
  });
};`;
    }

    return `
export const ${operationName} = (variables: ${operationVariablesTypes}, options?: ${omittedOptionType}) => {
  return ${this.apolloClientImportName}.${op}<${operationResultType}, ${operationVariablesTypes}>({
    ...options,
    ${node.operation}: ${documentVariableName},
    variables,
  });
};`;
  };
}
