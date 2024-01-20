const {Client} = require('pg');


const db_client = new Client({ 
    user: 'postgres', 
    host: 'localhost', 
    database: 'database', 
    password: '21072001r', 
    port: 3000, 
    }); 
    
db_client.connect();

async function setupTable(db_client) {
    let createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.gameoutcome
        (
        gamenumber integer NOT NULL DEFAULT 'nextval('gameoutcome_gamenumber_seq'::regclass)',
        date date NOT NULL,
        "time" time without time zone NOT NULL,
        timelength interval NOT NULL,
        outcome character varying(20) COLLATE pg_catalog."default" NOT NULL
    )
    `;
    return await db_client.query(createTableQuery);
}

async function get_data(){
    const query_req = 'SELECT * FROM public.gameoutcome';
    try {
        let query_res = await db_client.query(query_req)
        //console.log(query_res.rows)
        return query_res.rows; 
    }
    catch(err){
        console.log(err);
    }
}
async function add_data(date, time, timelength, outcome){
    const query_req = `INSERT INTO gameoutcome( date, time, timelength, outcome) VALUES ('${date}','${time}','${timelength}','${outcome}') `;
    try{
        await db_client.query(query_req)
        
    }
    catch(err){
        console.log(err);
    }
}

module.exports.get_data = get_data;
module.exports.add_data = add_data;