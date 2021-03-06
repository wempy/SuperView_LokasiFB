let fb_app = require("./config/fb-app.config.json");
const PARAMS = {
    fields: [
        "category_list",
        "engagement",
        "location",
        "parking",
        "price_range",
        "rating_count",
        "overall_star_rating",
        "restaurant_services",
        "restaurant_specialties"
    ].toString()
}
class FacebookAPI {

    constructor() {
        this.FB = require('fb');
        this.graph = require('fbgraph');
    }
    init(next) {
        this.FB.api('oauth/access_token', {
            client_id: fb_app.app_id,
            client_secret: fb_app.app_secret,
            grant_type: 'client_credentials'
        }, (res) => {
            if (!res || res.error) {
                return next(!res ? 'error occurred' : res.error);
            }
            this.graph.setAccessToken(res.access_token);
            next(null, 'ok');
        });
    }

    getPlaceByName(placeName, next) {
        var searchOptions = {
            q: placeName,
            fields: [
                "name",
                "id",
                "location"
            ].toString(),
            type: "Place"
        }
        // console.log(searchOptions, this.graph.getAccessToken());
        this.graph.search(searchOptions, (err, res) => {
            if (err) {
                return next(err)
            }
            return next(null, res);
        })
    }

    getPlaceInfo(place_to_search, next) {

        this.getPlaceByName(place_to_search.name, (err, res) => {
            if (err) {
                return next(err);
            }
            if (res.data.length == 0) {
                return next(null, { "status": "PLACE_NOT_FOUND" })
            }
            let target = null;
            if(place_to_search.city){
                res.data.forEach((prediction)=>{
                    if ( prediction.location.city=== place_to_search.city){
                          target = prediction;
                    }
                })
                if(!target){
                    return next(null, {"status": "PLACE_NOT_FOUND",
                                        "msg": `place ${place_to_search.name} from ${place_to_search.city} not found`})
                }
            }else{
                target = res.data[0]
            }
            // console.log(res);
            // let place = res.data[0];
            this.graph.get(target.id, PARAMS, (err, res) => {
                if (err)
                    return next(err);
                return next(null, res);
            })

        })
    }

}

module.exports = FacebookAPI;