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

const { Sequelize, DataTypes } = require("sequelize");

// Pass in the sequelize instance from the main server
module.exports = (sequelize) => {
  const Login = sequelize.define("Login", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    login_status: {
      type: DataTypes.ENUM("success", "failure"),
      defaultValue: "success",
    },
    login_time: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  });

  return Login;
};
