export default {
    db: {
        user: null,
        pass: null,
        host: 'localhost',
        port: '27017',
        database: 'testdb',
        authSource: null,
    },
    host: {
        url: '<server-url>',
        port: '3000',
    },
    jwt: {
        secretOrKey: 'secret',
        expiresIn: 3600,
    },
    mail: {
        host: 'smtpdm.aliyun.com',
        port: '465',
        secure: true,
        user: 'noreply@ses.nerdtech.space',
        pass: 'AZaz123456',
    },
    oss: {
        accessKeyId: 'LTAI4G5dQuu7HdXhJJwQgsXy',
        accessKeySecret: 'bfzzCjfe20IUtuj1txP2n1tOYtyLdp',
        arn: 'acs:ram::1273141742016971:role/hudexramoss',
        expires: 900,
        session: 'hudex',
        bucket: 'hudex',
    },
};
