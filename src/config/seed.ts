import Category from '../models/Category';
import User from '../models/User';
import Helper from '../models/Helper';
import Task from '../models/Task';
import bcrypt from 'bcrypt';

const seed = async () => {
  try {
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

    const users = [
      { name: 'John Doe', email: 'johndoe@mail.com', username: 'johndoe', password: await bcrypt.hash('password', 10) },
      { name: 'Jane Doe', email: 'janedoe@mail.com', username: 'janedoe', password: await bcrypt.hash('password', 10) },
      { name: 'Alice Doe', email: 'alicedoe@mail.com', username: 'alicedoe', password: await bcrypt.hash('password', 10) },
    ];
    const userList = await User.insertMany(users);

    const helper = [
      { name: 'Johny Doe', email: 'johnydoe@mail.com', username: 'johyndoe', password: await bcrypt.hash('password', 10) },
      { name: 'June Doe', email: 'junedoe@mail.com', username: 'junedoe', password: await bcrypt.hash('password', 10) },
      { name: 'Alice Doe', email: 'alicedoe@mail.com', username: 'alicedoe', password: await bcrypt.hash('password', 10) },
    ];
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
      {
        title: 'Task 2',
        description: 'Task 2 description',
        category: categoryList[1]._id,
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        status: 'NEW',
        specialInstructions: ['Task 2 special instruction'],
        owner: userList[1]._id,
        budget: 200,
        appliedHelpers: [helperList[1]._id],
      },
      {
        title: 'Task 3',
        description: 'Task 3 description',
        category: categoryList[2]._id,
        location: {
          type: 'Point',
          coordinates: [0, 0],
        },
        status: 'NEW',
        specialInstructions: ['Task 3 special instruction'],
        owner: userList[2]._id,
        budget: 300,
        appliedHelpers: [helperList[2]._id],
      },
    ];

    await Task.insertMany(tasks);
    console.log('Data seeded successfully');
  } catch (error) {
    console.log(error);
  }
};
export default seed;
