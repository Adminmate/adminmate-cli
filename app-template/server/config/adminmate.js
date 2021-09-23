// Get database instance
const db = require('../database');

module.exports = {

  // Test
  projectId: '',
  secretKey: '',
  authKey: '',
  masterPassword: '',

  models: [
    {
      slug: 'users',
      model: db.users,
      actions: [
        {
          label: 'test',
          code: 'invoice_download',
          target: ['item', 'bulk'],
          filter: item => {
            return true;
          }
        }
      ],
      options: {
        canUpdate: true,
        canDelete: true
      }
    },
    {
      slug: 'rooms',
      model: db.rooms,
      actions: []
    },
    {
      slug: 'reservations',
      model: db.reservations,
      actions: [
        {
          label: 'test',
          code: 'invoice_download',
          target: ['item', 'bulk'],
          filter: item => {
            return true;
          }
        }
      ],
      options: {
        canUpdate: true,
        canDelete: true
      }
    }
  ],

  authorizedIps: []
};