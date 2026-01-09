import {Kafka,type Admin, type Producer} from "kafkajs";
import dotenv from "dotenv"
import { join } from "path";
dotenv.config();


let Producer:Producer
let Admin : Admin

export const connnectkafka = async() => {
    try {
        const kafka = new Kafka({
            clientId:'auth-service',
            brokers:[process.env.KAFKA_BROKER||"localhost:9092"]
        })
      Admin = kafka.admin()
      await Admin.connect();
      const topic = await Admin.listTopics();
      if(!topic.includes("send_mail")){
        await Admin.createTopics({
            topics:[{
                topic:"send_mail",
                numPartitions:1,
                replicationFactor:1

            }],
            
        })
        console.log("send_email created")

      }

      Producer=  kafka.producer();
      await Producer.connect();
        console.log("✅ connected to kafka producer");
    } catch (error) {
        console.log("error : " , error);
        
    }
  
}
export const publishTopic = async(topic:string,message:any) => {
    if(!Producer){
        console.log("kafka producer not available");
        return
    }
    try {
        await Producer.send({
            topic,
            messages:[
                {
                    value:JSON.stringify(message)
                }
            ]
        })
    } catch (error) {
     console.log("failed to publish message to kafka",error);   
    }
  
}
export const disconnect = async() => {
    if(Producer){
        await Producer.disconnect();
    }
  

}



