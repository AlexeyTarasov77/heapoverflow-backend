import { readFileSync } from "fs";
import { load } from "js-yaml";
import { DataSource } from "typeorm";
import { faker } from '@faker-js/faker';
import { User } from 'src/users/entities/user.entity';
import { Question } from 'src/questions/entities/question.entity';
import { Answer } from 'src/questions/entities/answer.entity';
import { Comment } from 'src/questions/entities/comment.entity';
import { Collection } from 'src/questions/entities/collection.entity';
import { SavedAnswer } from 'src/questions/entities/saved-answer.entity';

async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const questionRepository = dataSource.getRepository(Question);
  const answerRepository = dataSource.getRepository(Answer);
  const commentRepository = dataSource.getRepository(Comment);
  const collectionRepository = dataSource.getRepository(Collection);
  const savedAnswerRepository = dataSource.getRepository(SavedAnswer);

  // Create users
  const users: User[] = [];
  for (let i = 0; i < 10; i++) {
    const user = userRepository.create({
      username: faker.internet.username(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
    });
    users.push(await userRepository.save(user));
  }

  // Create questions
  const questions: Question[] = [];
  for (let i = 0; i < 5; i++) {
    const question = questionRepository.create({
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(2),
      tags: faker.lorem.words(3).split(' '),
      author: users[faker.number.int({ min: 0, max: users.length - 1 })],
    });
    questions.push(await questionRepository.save(question));
  }

  // Create answers
  const answers: Answer[] = [];
  for (let i = 0; i < 15; i++) {
    const answer = answerRepository.create({
      body: faker.lorem.paragraph(),
      question: questions[faker.number.int({ min: 0, max: questions.length - 1 })],
      author: users[faker.number.int({ min: 0, max: users.length - 1 })],
      upvotes: faker.number.int({ min: 0, max: 100 }),
    });
    answers.push(await answerRepository.save(answer));
  }

  // Create comments
  for (let i = 0; i < 20; i++) {
    const comment = commentRepository.create({
      body: faker.lorem.sentence(),
      author: users[faker.number.int({ min: 0, max: users.length - 1 })],
      parentComment: i % 2 === 0 ? null : faker.helpers.arrayElement(await commentRepository.find()),
    });
    await commentRepository.save(comment);
  }

  // Create collections
  const collections: Collection[] = [];
  for (let i = 0; i < 5; i++) {
    const collection = collectionRepository.create({
      name: faker.commerce.productName(),
    });
    collections.push(await collectionRepository.save(collection));
  }

  // Create saved answers
  for (let i = 0; i < 10; i++) {
    const savedAnswer = savedAnswerRepository.create({
      user: users[faker.number.int({ min: 0, max: users.length - 1 })],
      answer: answers[faker.number.int({ min: 0, max: answers.length - 1 })],
      collection: collections[faker.number.int({ min: 0, max: collections.length - 1 })],
    });
    await savedAnswerRepository.save(savedAnswer);
  }

  console.log('Database seeded successfully!');
}

const config = load(readFileSync(".src/config/local.yaml", 'utf8')) as Record<string, any>;
const dsn = new DataSource({
  type: "postgres",
  host: config.db.host,
  port: config.db.port,
  name: config.db.name
})
seedDatabase(dsn)
