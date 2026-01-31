import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TagsByCategoriesResponse {
  @Field(() => String)
  tagsByCategories: string; // JSON string for now
}

@ObjectType()
export class SeriesTemplate {
  @Field()
  ticker: string;

  @Field()
  title: string;

  @Field()
  category: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  frequency: string;

  @Field({ nullable: true })
  description?: string;
}
