import { Test } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

describe('GraphQLModule (smoke)', () => {
  it('should create a minimal GraphQLModule instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: false,
          playground: false,
        }),
      ],
    }).compile();

    const gql = moduleRef.get(GraphQLModule as any);
    expect(gql).toBeDefined();
    await moduleRef.close();
  });
});
