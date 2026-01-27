#import "WidgetBridge.h"

#if __has_include(<WidgetKit/WidgetKit.h>)
#import <WidgetKit/WidgetKit.h>
#endif

@implementation WidgetBridge

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getAppGroupPath:(NSString *)groupId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  if (groupId == nil || groupId.length == 0) {
    reject(@"invalid_group_id", @"groupId is required.", nil);
    return;
  }

  NSURL *containerURL = [[NSFileManager defaultManager]
      containerURLForSecurityApplicationGroupIdentifier:groupId];
  if (containerURL == nil) {
    reject(@"container_not_found", @"App Group container not found.", nil);
    return;
  }

  resolve([containerURL path]);
}

RCT_EXPORT_METHOD(reloadAllTimelines)
{
#if __has_include(<WidgetKit/WidgetKit.h>)
  if (@available(iOS 14.0, *)) {
//    [[WidgetCenter sharedCenter] reloadAllTimelines];
  }
#endif
}

@end
