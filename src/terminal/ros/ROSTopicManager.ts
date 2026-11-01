import { rosBus } from '../../ros/messageBus';
import { useSimulationStore } from '../../state/simulationStore';
import { RosTwist } from '../../types/ros';

export class ROSTopicManager {
  public static list(verbose = false, isRos2 = false): string {
    const topics = rosBus.getTopics();
    if (!verbose) {
      if (isRos2) {
        return topics.map((t) => t.name).join('\n');
      }
      return topics.map((t) => `${t.name}   [${t.type}]`).join('\n');
    }

    // Verbose listing
    let out = 'Published topics:\n';
    for (const t of topics) {
      out += ` * ${t.name} [${t.type}] ${t.publishers.length} publisher(s)\n`;
    }
    out += '\nSubscribed topics:\n';
    for (const t of topics) {
      out += ` * ${t.name} [${t.type}] ${t.subscribers.length} subscriber(s)\n`;
    }
    return out.trim();
  }

  public static info(topicName: string, isRos2 = false): string {
    const topic = rosBus.getTopicInfo(topicName);
    if (!topic) {
      return `ERROR: Unknown topic ${topicName}`;
    }

    if (isRos2) {
      return `Type: ${topic.type.replace('/', '/msg/')}\nPublisher count: ${topic.publishers.length}\nSubscription count: ${topic.subscribers.length}`;
    }

    let out = `Type: ${topic.type}\n\n`;
    out += 'Publishers:\n';
    for (const p of topic.publishers) {
      out += ` * ${p} (http://turtlebot3:${Math.floor(30000 + Math.random() * 20000)}/)\n`;
    }
    out += '\nSubscribers:\n';
    for (const s of topic.subscribers) {
      out += ` * ${s} (http://turtlebot3:${Math.floor(30000 + Math.random() * 20000)}/)\n`;
    }
    return out.trim();
  }

  public static type(topicName: string, isRos2 = false): string {
    const topic = rosBus.getTopicInfo(topicName);
    if (!topic) {
      return `ERROR: Unknown topic ${topicName}`;
    }
    return isRos2 ? topic.type.replace('/', '/msg/') : topic.type;
  }

  public static hz(topicName: string): string {
    const topic = rosBus.getTopicInfo(topicName);
    if (!topic) {
      return `ERROR: Unknown topic ${topicName}`;
    }

    let rate = 30.0;
    if (topicName === '/scan') {
      const scanData = useSimulationStore.getState().scanData;
      rate = scanData ? scanData.scanFrequency : 5.0;
    } else if (topicName === '/odom' || topicName === '/tf') {
      rate = 50.0;
    } else if (topicName === '/cmd_vel') {
      rate = 10.0;
    } else if (topicName === '/map') {
      rate = 1.0;
    }

    return `subscribed to [${topicName}]\naverage rate: ${rate.toFixed(1)} Hz\nmin: ${(1 / (rate * 1.05)).toFixed(3)}s max: ${(1 / (rate * 0.95)).toFixed(3)}s std dev: 0.0012s window: 50`;
  }

  /**
   * Parses publisher argument data and publishes to the message bus
   */
  public static publishMessage(
    topicName: string,
    messageType: string,
    dataPayload: string
  ): { success: boolean; output: string } {
    let parsedData: any = null;

    // Try parsing as JSON or YAML-like key: value
    try {
      if (dataPayload.startsWith('{') && dataPayload.endsWith('}')) {
        // Replace unquoted keys if necessary
        const jsonStr = dataPayload.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
        parsedData = JSON.parse(jsonStr);
      }
    } catch {
      parsedData = null;
    }

    // Specialize for geometry_msgs/Twist
    if (topicName === '/cmd_vel' || messageType.includes('Twist')) {
      let linearX = 0;
      let angularZ = 0;

      if (parsedData?.linear?.x !== undefined) {
        linearX = Number(parsedData.linear.x) || 0;
      }
      if (parsedData?.angular?.z !== undefined) {
        angularZ = Number(parsedData.angular.z) || 0;
      }

      // Regex fallbacks for format: linear: {x: 0.2}, angular: {z: 0.5}
      const linMatch = dataPayload.match(/linear\s*:\s*\{?[^}]*x\s*:\s*([-0-9.]+)/i);
      if (linMatch) linearX = parseFloat(linMatch[1]);

      const angMatch = dataPayload.match(/angular\s*:\s*\{?[^}]*z\s*:\s*([-0-9.]+)/i);
      if (angMatch) angularZ = parseFloat(angMatch[1]);

      const twistMsg: RosTwist = {
        linear: { x: linearX, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angularZ },
      };

      rosBus.publish('/cmd_vel', twistMsg);
      // Dispatch velocity directly into simulation physics engine!
      useSimulationStore.getState().setTeleopVelocity(linearX, angularZ);

      return {
        success: true,
        output: `publishing to ${topicName} [geometry_msgs/Twist]: linear.x=${linearX}, angular.z=${angularZ}`,
      };
    }

    // Fallback publish
    rosBus.publish(topicName, parsedData ?? dataPayload);
    return {
      success: true,
      output: `published message to [${topicName}]`,
    };
  }
}

