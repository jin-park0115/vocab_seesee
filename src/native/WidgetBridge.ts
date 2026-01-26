import {NativeModules, Platform} from 'react-native';

type WidgetBridgeModule = {
  getAppGroupPath(groupId: string): Promise<string>;
  reloadAllTimelines(): void;
};

const WidgetBridge = NativeModules.WidgetBridge as
  | WidgetBridgeModule
  | undefined;

export async function getAppGroupPath(groupId: string): Promise<string> {
  if (Platform.OS !== 'ios') {
    throw new Error('WidgetBridge is only available on iOS.');
  }
  if (!WidgetBridge?.getAppGroupPath) {
    throw new Error('WidgetBridge native module is not linked.');
  }
  return WidgetBridge.getAppGroupPath(groupId);
}

export function reloadAllTimelines(): void {
  if (Platform.OS !== 'ios') {
    return;
  }
  WidgetBridge?.reloadAllTimelines?.();
}
