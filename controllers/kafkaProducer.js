// kafkaProducer.js
import kafka from 'kafka-node';
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9990' });

const producer = new kafka.Producer(client);

const kafkaTopic = 'orderStatusUpdates';

producer.on('ready', () => {
    console.log('Kafka Producer is connected and ready.');
});

producer.on('error', function (error) {
    console.error('Producer error:', error);
});

export const sendOrderUpdate = (order) => {
    const messageBuffer = Buffer.from(JSON.stringify(order));

    const payload = [
        {
            topic: kafkaTopic,
            messages: messageBuffer,
            attributes: 1 /* Use GZip compression for the payload */
        }
    ];

    producer.send(payload, (error, result) => {
        console.info('Sent payload to Kafka:', payload);
        if (error) {
            console.error('Sending payload failed:', error);
        }
    });
};


