// Copyright 2025 Amartya Roy, Hrishikesh Kumar Chaudhary, Madhu Singh, Anshika
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// config/database.js
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql", // or 'postgres', 'sqlite', etc.
  host: "localhost", // Your database host
  username: "amartya", // Your DB username
  password: "amartya", // Your DB password
  database: "user_registration", // Your DB name
});

module.exports = sequelize;
