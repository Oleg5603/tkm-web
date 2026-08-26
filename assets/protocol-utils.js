const TkmProtocolUtils={
  urgentPattern:/(кровотеч|боль в груди|кровохаркан|инсульт|одышк|нарушен.*реч|потер.*созн|онемени|паралич|остр.*живот)/i,
  hasUrgent(items){return items.some(item=>this.urgentPattern.test(String(item)))},
  limitPoints(points,pointLimit,protectedIndex=-1){
    if(pointLimit==null)return points;
    const limit=pointLimit===0?5:pointLimit;
    if(protectedIndex>=limit){const safe=[...points];const protectedPoint=safe.splice(protectedIndex,1)[0];safe.splice(limit-1,0,protectedPoint);return safe.slice(0,limit)}
    return points.slice(0,limit);
  }
};
if(typeof module!=='undefined'&&module.exports)module.exports=TkmProtocolUtils;
