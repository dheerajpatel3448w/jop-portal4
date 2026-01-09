import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendmailtoconsumer =async()=>{
try{
    const kafka = new Kafka({
        clientId: 'mail-service',
        brokers: [process.env.KAFKA_BROKER||'localhost:9092']
      });
        const consumer = kafka.consumer({ groupId: 'mail-service-group' });
        await consumer.connect();   
        const topicname = 'send_mail';
        await consumer.subscribe({topic:topicname,fromBeginning:false});
        console.log("✅ mail service started ");
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const {to,subject,html}=JSON.parse(message.value?.toString()||"");
                   const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD
                    }
                   })
                     await transporter.sendMail({

                    from:"HireHeaven <no-reply>",
                    to,
                    subject,
                    html,
                     })
                     console.log(" mail sent successfully");
                } catch (error) {
                    console.log("Error in sending mail:", error);
                    
                }
            }
        })
    }
catch(err){
    console.log("Kafka connection error",err);
}
}