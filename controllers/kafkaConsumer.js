// kafkaConsumer.js
import kafka from 'kafka-node';
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9990' });

const consumer = new kafka.Consumer(
    client,
    [{ topic: 'orderStatusUpdates', partition: 0 }],
    {
        autoCommit: true
    }
);

consumer.on('message', function (message) {
    console.log('Received message:', message.value.toString());
});

consumer.on('error', function (err) {
    console.log('Error:', err);
});
