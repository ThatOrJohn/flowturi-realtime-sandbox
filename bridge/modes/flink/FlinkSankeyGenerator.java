/*
 * This is a sample Flink job for generating Sankey data.
 * In a real deployment, this would be compiled into a JAR and deployed to Flink.
 */

import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.source.SourceFunction;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

public class FlinkSankeyGenerator {

    private static final String KAFKA_TOPIC = "flowturi-data";
    private static final String KAFKA_BOOTSTRAP_SERVERS = "kafka:9092";
    private static final long INTERVAL_MS = 1000;

    public static void main(String[] args) throws Exception {
        // Set up the execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Generate a stream of Sankey diagram data
        DataStream<String> sankeyDataStream = env
                .addSource(new SankeyDataSource())
                .map(new SankeyDataToJsonMapper());

        // Sink the data to Kafka
        FlinkKafkaProducer<String> kafkaProducer = new FlinkKafkaProducer<>(
                KAFKA_BOOTSTRAP_SERVERS,
                KAFKA_TOPIC,
                new SimpleStringSchema()
        );

        sankeyDataStream.addSink(kafkaProducer);

        // Execute the Flink job
        env.execute("Flowturi Synthetic Data Generator");
    }

    /**
     * Source function that generates synthetic Sankey data
     */
    public static class SankeyDataSource implements SourceFunction<SankeyData> {
        private volatile boolean isRunning = true;
        private final Random random = new Random();
        private final AtomicInteger tick = new AtomicInteger(0);

        @Override
        public void run(SourceContext<SankeyData> ctx) throws Exception {
            while (isRunning) {
                SankeyData data = generateSankeyData();
                ctx.collect(data);
                
                // Sleep to control the data generation rate
                Thread.sleep(INTERVAL_MS);
            }
        }

        @Override
        public void cancel() {
            isRunning = false;
        }

        private SankeyData generateSankeyData() {
            SankeyData data = new SankeyData();
            data.setTimestamp(System.currentTimeMillis());
            data.setTick(tick.getAndIncrement());
            
            // Create nodes
            Map<String, SankeyNode> nodes = new HashMap<>();
            nodes.put("data_source", new SankeyNode("data_source", "Data Source"));
            nodes.put("processor_1", new SankeyNode("processor_1", "Processor 1"));
            nodes.put("processor_2", new SankeyNode("processor_2", "Processor 2"));
            nodes.put("analytics_1", new SankeyNode("analytics_1", "Analytics 1"));
            nodes.put("analytics_2", new SankeyNode("analytics_2", "Analytics 2"));
            nodes.put("data_sink", new SankeyNode("data_sink", "Data Sink"));
            data.setNodes(nodes.values().toArray(new SankeyNode[0]));
            
            // Generate flow values
            int sourceToProc1 = random.nextInt(40) + 30; // 30-70
            int sourceToProc2 = random.nextInt(30) + 20; // 20-50
            
            int proc1ToAnalytics1 = (int) (sourceToProc1 * (random.nextDouble() * 0.3 + 0.6)); // 60-90% of input
            int proc1ToAnalytics2 = sourceToProc1 - proc1ToAnalytics1; // Remainder
            
            int proc2ToAnalytics1 = (int) (sourceToProc2 * (random.nextDouble() * 0.4 + 0.3)); // 30-70% of input
            int proc2ToAnalytics2 = sourceToProc2 - proc2ToAnalytics1; // Remainder
            
            int analytics1ToSink = proc1ToAnalytics1 + proc2ToAnalytics1;
            int analytics2ToSink = proc1ToAnalytics2 + proc2ToAnalytics2;
            
            // Create links
            SankeyLink[] links = new SankeyLink[]{
                new SankeyLink("data_source", "processor_1", sourceToProc1),
                new SankeyLink("data_source", "processor_2", sourceToProc2),
                new SankeyLink("processor_1", "analytics_1", proc1ToAnalytics1),
                new SankeyLink("processor_1", "analytics_2", proc1ToAnalytics2),
                new SankeyLink("processor_2", "analytics_1", proc2ToAnalytics1),
                new SankeyLink("processor_2", "analytics_2", proc2ToAnalytics2),
                new SankeyLink("analytics_1", "data_sink", analytics1ToSink),
                new SankeyLink("analytics_2", "data_sink", analytics2ToSink)
            };
            data.setLinks(links);
            
            return data;
        }
    }

    /**
     * Maps SankeyData objects to JSON strings
     */
    public static class SankeyDataToJsonMapper implements MapFunction<SankeyData, String> {
        private final ObjectMapper mapper = new ObjectMapper();
        
        @Override
        public String map(SankeyData data) throws Exception {
            ObjectNode root = mapper.createObjectNode();
            root.put("timestamp", new java.util.Date(data.getTimestamp()).toInstant().toString());
            root.put("tick", data.getTick());
            
            ArrayNode nodesArray = root.putArray("nodes");
            for (SankeyNode node : data.getNodes()) {
                ObjectNode nodeObj = nodesArray.addObject();
                nodeObj.put("id", node.getId());
                nodeObj.put("label", node.getLabel());
            }
            
            ArrayNode linksArray = root.putArray("links");
            for (SankeyLink link : data.getLinks()) {
                ObjectNode linkObj = linksArray.addObject();
                linkObj.put("source", link.getSource());
                linkObj.put("target", link.getTarget());
                linkObj.put("value", link.getValue());
            }
            
            return mapper.writeValueAsString(root);
        }
    }
    
    /**
     * Data model classes
     */
    public static class SankeyData {
        private long timestamp;
        private int tick;
        private SankeyNode[] nodes;
        private SankeyLink[] links;
        
        // Getters and setters
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
        
        public int getTick() { return tick; }
        public void setTick(int tick) { this.tick = tick; }
        
        public SankeyNode[] getNodes() { return nodes; }
        public void setNodes(SankeyNode[] nodes) { this.nodes = nodes; }
        
        public SankeyLink[] getLinks() { return links; }
        public void setLinks(SankeyLink[] links) { this.links = links; }
    }
    
    public static class SankeyNode {
        private String id;
        private String label;
        
        public SankeyNode(String id, String label) {
            this.id = id;
            this.label = label;
        }
        
        // Getters
        public String getId() { return id; }
        public String getLabel() { return label; }
    }
    
    public static class SankeyLink {
        private String source;
        private String target;
        private int value;
        
        public SankeyLink(String source, String target, int value) {
            this.source = source;
            this.target = target;
            this.value = value;
        }
        
        // Getters
        public String getSource() { return source; }
        public String getTarget() { return target; }
        public int getValue() { return value; }
    }
} 