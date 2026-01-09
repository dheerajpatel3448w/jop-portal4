import { neon } from "@neondatabase/serverless";
import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const db = neon(process.env.DB_URI as string);
//export const client = new Redis(process.env.REDIS_URL!);


export const connectDb = async () => {

    try {
      await db`do 
      $$
      begin
      if not exists (select 1 from pg_type where typname='job_type') then 
      create type job_type as enum ('full_time','part_time','contract','internship');
      end if;
      if not exists (select 1 from pg_type where typname ='work_location') then
      create type work_location as enum ('on_site','remote','hybrid');
      end if;
      if not exists (select 1 from pg_type where typname='application_status' ) then
      create type application_status as enum ('submitted','rejected','hired');
      end if;
      end 
      $$
      `
     await db`
           create table if not exists companies(
            company_id serial primary key,
            name varchar(255) not null unique,
            description text not null,
            website varchar(255) not null,
            logo varchar(255) not null,
            logo_public_id varchar(255) not null,
            recruiter_id integer not null,
            created_at timestamptz not null default current_timestamp
            );
         `
   
      await db`
      create table if not exists jobs(
      job_id serial primary key,
      title varchar(255) not null,
      description text not null,
      salary numeric(10,2),
      location varchar(255),
      job_type job_type not null,
      openings integer not null,
      role varchar(255) not null,
      work_location work_location not null,
      company_id integer not null references companies(company_id) on delete cascade,
      posted_by_recuriter_id integer not null,
      created_at timestamptz not null default current_timestamp,
      is_active boolean default true
    
      );
      `
      await db`
      create table if not exists applications(
      application_id serial primary key,
      job_id integer not null references jobs(job_id) on delete cascade,
      applicant_id integer not null ,
      applicant_email varchar(255) not null,
      status application_status not null default 'submitted',
      resume varchar(255) not null,
      applied_at timestamptz not null default current_timestamp,
      subscribed boolean,
      unique(job_id,applicant_id)
      
      );
      
      `
      console.log("✅ database connected successfully");
    }catch(error){
      console.log("❌ database not connected : " , {
        error
      
      })

    }

}   

