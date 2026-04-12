import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useSocket } from "../../src/context/SocketContext";
import { C } from "../../src/theme";

function Badge({ count }) {
  if (!count) return null;
  return (
    <View style={{ position:"absolute", top:-4, right:-6, backgroundColor:C.red, borderRadius:8, minWidth:16, height:16, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ color:"#fff", fontSize:9, fontWeight:"700" }}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

function Icon({ name, color, size, badge }) {
  return <View><Ionicons name={name} size={size} color={color} /><Badge count={badge} /></View>;
}

export default function TabsLayout() {
  const socket = useSocket();
  const unreadMsg = socket?.unreadMessages ?? 0;
  const unreadNotif = socket?.unreadNotifications ?? 0;

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 62, paddingBottom: 8 },
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.muted,
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
    }}>
      <Tabs.Screen name="index"    options={{ title:"Home",     tabBarIcon: ({color,size,focused}) => <Icon name={focused?"home":"home-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="cars"     options={{ title:"Cars",     tabBarIcon: ({color,size,focused}) => <Icon name={focused?"car":"car-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="rentals"  options={{ title:"Rentals",  tabBarIcon: ({color,size,focused}) => <Icon name={focused?"car-sport":"car-sport-outline"} color={color} size={size} /> }} />
      <Tabs.Screen name="messages" options={{ title:"Messages", tabBarIcon: ({color,size,focused}) => <Icon name={focused?"chatbubbles":"chatbubbles-outline"} color={color} size={size} badge={unreadMsg} /> }} />
      <Tabs.Screen name="profile"  options={{ title:"Profile",  tabBarIcon: ({color,size,focused}) => <Icon name={focused?"person":"person-outline"} color={color} size={size} badge={unreadNotif} /> }} />
    </Tabs>
  );
}
