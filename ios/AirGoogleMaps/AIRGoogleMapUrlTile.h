//
//  AIRGoogleMapURLTile.h
//  Created by Nick Italiano on 11/5/16.
//

#import <Foundation/Foundation.h>
#import <GoogleMaps/GoogleMaps.h>

@interface AIRGoogleMapUrlTile : UIView

<<<<<<< Updated upstream
@property (nonatomic, strong) GMSURLTileLayer *tileLayer;
=======
@property (nonatomic, strong) GMSTileLayer *tileLayer;
>>>>>>> Stashed changes
@property (nonatomic, assign) NSString *urlTemplate;
@property (nonatomic, assign) int zIndex;

@end
