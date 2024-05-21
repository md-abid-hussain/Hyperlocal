import Category from '../models/Category';
import User from '../models/User';
import Helper from '../models/Helper';
import Task from '../models/Task';

const seed = async () => {
  const categories = [
    { name: 'Home Improvement' },
    { name: 'Yard & Garden Care' },
    { name: 'Tech Support' },
    { name: 'Event Help' },
    { name: 'Pet Care' },
    { name: 'Errands & Delivery' },
    { name: 'Handyman services' },
    { name: 'Others' },
  ];

  const categoryList = await Category.insertMany(categories);

  const users = [{ name: 'John Doe', email: 'johndoe@mail.com', username: 'johndoe', password: 'password' }];
  const userList = await User.insertMany(users);

  const helper = [{ name: 'John Doe', email: 'johndoe@email.com', username: 'johndoe', password: 'password' }];
  const helperList = await Helper.insertMany(helper);

  const tasks = [
    {
      title: 'Task 1',
      description: 'Task 1 description',
      category: categoryList[0]._id,
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      status: 'NEW',
      specialInstructions: ['Task 1 special instruction'],
      owner: userList[0]._id,
      budget: 100,
      appliedHelpers: [helperList[0]._id],
    },
  ];

  await Task.insertMany(tasks);
};
export default seed;
