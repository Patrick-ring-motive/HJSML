function backLink(x){
  const track = [];
  let warn = true;
  function bak(obj){
    for(const key in obj){
      try{
        if(!obj[key]['&parent']){
          obj[key]['&parent'] = obj;
          if(!track.includes(obj[key])){
            track.push(obj[key]);
            bak(obj[key]);
          }
        }
      }catch(e){
        if(warn){
          console.warn(e,...arguments);
          warn = false;
        }
      }
    }
    return bak;
  }
  return bak(x);
}