export const environment = {
    production: false,
    //url: 'http://localhost:3032/',
    url: 'https://inno-api-42r5.onrender.com/',
    modules: 'supplies,products,combos,extras,queue,queueSeller',
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    catalogs: 'supplies,products,combos',
    //socket: 'http://localhost:3032/',
    socket: 'https://inno-api-42r5.onrender.com/'
};