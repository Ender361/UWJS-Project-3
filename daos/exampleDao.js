// Basic starter DAO
import Example from '../models/exampleModel.js';

export async function getAllExamples() {
  return Example.find();
}
