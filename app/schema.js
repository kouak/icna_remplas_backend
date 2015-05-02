var schema = {
  users: {
    id: {type: 'increments', nullable: false, primary: true},
    email: {type: 'string', maxlength: 254, nullable: false, unique: true},
    name: {type: 'string', maxlength: 150, nullable: false},
    first_name: {type: 'string', maxlength: 150, nullable: false},
    password: {type: 'string', maxlength: 254, nullable: false},
    balance: {type: 'integer', unsigned: true, defaultTo: 0, nullable: false},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    last_login: {type: 'dateTime', nullable: false, defaultTo: new Date(0)},
    reset_password_token: {type: 'string', nullable: true},
    reset_password_expires: {type: 'dateTime', nullable: false, defaultTo: new Date(0)},
    // Associations
    team_id: {type: 'integer', nullable: false}
  },

  teams: {
    id: {type: 'increments', nullable: false, primary: true},
    name: {type: 'string', maxlength: 150, nullable: false},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true},
    center_id: {type: 'integer', nullable: false}
  },

  centers: {
    id: {type: 'increments', nullable: false, primary: true},
    name: {type: 'string', maxlength: 150, nullable: false},
    days_in_cycle: {type: 'integer', nullable: false, defaultTo: 12},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
  },

  vacations: {
    id: {type: 'increments', nullable: false, primary: true},
    name: {type: 'string', maxlength: 150, nullable: false},
    work_day: {type: 'bool', maxlength: 150, nullable: false, defaultTo: true, validations: {isIn: [[0, 1, false, true]]}},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
  }
};

module.exports = schema;

