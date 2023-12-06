const mongoose = require('mongoose');

module.exports.initialize = (mongoConnectionString) => {
    mongoose.connect(`${mongoConnectionString}&useNewUrlParser=true&useUnifiedTopology=true`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      
 
    });
  
    const db = mongoose.connection;
    

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
    const restaurantSchema = new mongoose.Schema({
      name: String,
      borough: String,
      cuisine: String,
      address: {
        building: String,
        coord: [Number],
        street: String,
        zipcode: String,
      },
      grades: [{
        date: Date,
        grade: String,
        score: Number,
      }],
      restaurant_id: String,
    });

    Restaurant = mongoose.model('Restaurant', restaurantSchema);
  });
};

module.exports.addNewRestaurant = (data) => {
  const newRestaurant = new Restaurant(data);
  return newRestaurant.save();
};

module.exports.getAllRestaurants = (page, perPage, borough) => {
  const skip = perPage * (page - 1);
  let query = Restaurant.find().skip(skip).limit(perPage).sort({ restaurant_id: 1 });
  if (borough) {
    query = query.where('borough').equals(borough);
  }
  return query.exec();
};

module.exports.getRestaurantById = (Id) => {
  return Restaurant.findById(Id).exec();
};

module.exports.updateRestaurantById = (data, Id) => {
  return Restaurant.findByIdAndUpdate(Id, data, { new: true }).exec();
};

module.exports.deleteRestaurantById = (Id) => {
  return Restaurant.findByIdAndDelete(Id).exec();
};
