class CommonUtil {
    static async objectHasProperty (obj, prop) {
        for (var p in obj) {
          if (obj.hasOwnProperty(p)) {
              if (p === prop) {
                  return obj;
              } else if (obj[p] instanceof Object && CommonUtil.objectHasProperty(obj[p], prop)) {
                  return obj[p];
              }
          }
        }
        return null;
      }

}

module.exports = CommonUtil;