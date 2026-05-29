// Basic starter model
import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
  name: String,
});

const Example = mongoose.model('Example', ExampleSchema);
export default Example;
