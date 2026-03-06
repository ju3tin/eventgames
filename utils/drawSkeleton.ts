export function drawSkeleton(pose:any, canvas:HTMLCanvasElement|null){
    if(!canvas) return
    const ctx = canvas.getContext("2d")
    if(!ctx) return
    ctx.clearRect(0,0,canvas.width,canvas.height)
  
    pose.keypoints.forEach((k:any)=>{
      if(k.score>0.4){
        ctx.beginPath()
        ctx.arc(k.x,k.y,5,0,2*Math.PI)
        ctx.fillStyle="lime"
        ctx.fill()
      }
    })
  }