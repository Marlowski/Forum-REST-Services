const AccessControl = require('accesscontrol');


let grantObjects = {
    user: {
        post: {
            'read:any': ['*'],
            'create:own': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        },
        account: {
            'read:any': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        },
        message: {
            'create:own': ['*'],
            'read:own': ['*'],
            'delete:own': ['*']
        },
        newsletter: {
            'update:own': ['*']
        },
        comment: {
            'create:own': ['*'],
            'update:own': ['*'],
            'read:any': ['*'],
            'delete:own': ['*']
        }
    },
    registered: {
        post: {
            'read:any': ['*'],
        },
        message: {
            'read:own': ['*'],
            'delete:own': ['*']
        },
        account: {
            'read:any': ['*'],
            'update:own': ['*'],
            'delete:own': ['*']
        }
    },
    admin: {
        post: {
            'read:any': ['*'],
            'create:own': ['*'],
            'update:any': ['*'],
            'update:own': ['*'],
            'delete:any': ['*'],
            'delete:own': ['*']
        },
        account: {
            'read:any': ['*'],
            'create:any': ['*'],
            'create:own': ['*'],
            'update:any': ['*'],
            'update:own': ['*'],
            'delete:any': ['*'],
            'delete:own': ['*']
        },
        message: {
            'create:own': ['*'],
            'read:any': ['*'],
            'delete:own': ['*']
        },
        newsletter: {
            'update:own': ['*'],
            'update:any': ['*'],
            'create:any': ['*']
        },
        forum: {
            'create:any': ['*'],
            'delete:any': ['*'],
            'update:any': ['*']
        },
        comment: {
            'read:any': ['*'],
            'create:any': ['*'],
            'create:own': ['*'],
            'update:any': ['*'],
            'update:own': ['*'],
            'delete:any': ['*'],
            'delete:own': ['*']
        }
    }
}

const ac = new AccessControl(grantObjects);


module.exports.AccesControlObj = ac;
