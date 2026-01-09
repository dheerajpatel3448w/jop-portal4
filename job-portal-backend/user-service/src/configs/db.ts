import { neon } from "@neondatabase/serverless";
import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const db = neon(process.env.DB_URI!);
//export const client = new Redis(process.env.REDIS_URL!);
/*client.connect().then(()=>{
  console.log("connect to redis")
}).catch(console.error);
*/

export const connectDb = async () => {

    try {
          await db` DO $$
           BEGIN 
           IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
           CREATE TYPE user_role AS ENUM ('job_seeker', 'recruiter');
           END IF;
            END $$ LANGUAGE plpgsql;
          `;
          await db`
          CREATE TABLE IF NOT  EXISTS users (
            user_id serial primary key,
            name varchar(255) not null,
            email varchar(255) unique not null,
            password varchar(255) not null,
            role user_role not null,
            phone_number varchar(20) not null,
            bio  text,
            resume varchar(255),
            resume_public_id varchar(255),
            profile_pic varchar(255),
            profile_pic_public_id varchar(255),
            created_at TIMESTAMPTZ DEFAULT current_timestamp,
            updated_at TIMESTAMPTZ DEFAULT current_timestamp,
            subscription TIMESTAMPTZ
            ) ;
          `;
          await db`
          CREATE TABLE IF NOT EXISTS skills(
            skill_id serial primary key,
            name varchar(100) unique not null
          );
          `;
          await db`
          CREATE TABLE IF NOT EXISTS user_skills(
            user_id integer not null references users(user_id) on delete cascade,
            skill_id integer not null references skills(skill_id) on delete cascade,
            primary key (user_id, skill_id)
          );
          `;
            console.log("Database connected successfully ✅");
    } catch (error) {
        console.error("Database connection failed ❌:", error);
        throw error;
        
    }

}   

export const connectredis = () => {
  
}
