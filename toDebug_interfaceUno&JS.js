var five = require("johnny-five");
var board = new five.Board();

//board.setMaxListeners(50);

//
var status = 0;
var beats = new Array(-10000, 1098, 1913, 2712, 3511, 4357, 5188, 6011);
 //6785, 7584, 8359, 9174, 9924, 10724, 11522, 12305, 13088, 13918, 14653, 15435, 16194, 16961, 17806, 18556, 19387, 20169, 20920, 21711, 22486, 23277, 24084);
var ptr = 1;

//results
var marking = new Array(0); //start from 1; per:0, great:1, miss:2
var max_combo = 0;
var perfect = 0;
var great = 0;
var miss = 0;

var prev1 = 0, prev0 = 0;

function getid(randnum)
{
  if (randnum < 0.25)
    return 1;
  if (randnum < 0.5)
    return 2;
  if (randnum < 0.75)
    return 3;
  return 4;
}

board.on("ready", function() {

  if (status == 0) //Game not started yet
  {
    status = 1;
    
    //setup the hardware
    var motor1 = new five.Motor(6);
    var motor2 = new five.Motor(5);
    var servo1 = new five.Servo(3);
    var servo2 = new five.Servo(9);
    var button1 = new five.Button(2);
    var button2 = new five.Button(7);
    var button3 = new five.Button(8);
    var button4 = new five.Button(4);

    servo1.to(0, 500);
    servo2.to(0, 500);

    console.log("init completed");

    //set the initial time
    var ts = (new Date()).getTime();
    console.log("time set");
  }

  if (status == 1) //In process, marking
  {
    console.log("debug");
    //special-judge
    if (ptr >= beats.length)
    {
      status = 2;
      console.log("1");
    }
    else
    {
      console.log("2");
      var flag = 0;
      //const
      var h_t = 500; //half time interval
      var d_per = 150; // define +-delta as 'perfect'
      var d_grt = 350; // 

      //
      var cur_t = (new Date()).getTime() - ts;
      var hit_t = 0;
      console.log("test1:"+cur_t+" "+h_t+" "+beats[ptr]+" "+h_t);
      if (cur_t >= beats[ptr] - h_t)
      {
        console.log("fire");
        var randnum = getid(Math.random());
        while (randnum == prev1 || randnum == prev0)
        {
          randnum = getid(Math.random());
        }
        console.log("proceed");
        prev1 = prev0;
        prev0 = randnum;
        if (randnum == 1)//button1, motor 1
        {
          console.log("but1");
          motor1.start(150);
          var lts = (new Date()).getTime();
          hit_t = beats[ptr] - h_t;
          flag = 0;
          while ((new Date()).getTime() - lts < (2 * h_t))
          {
            if (flag == 0)
            {
              button1.on("press", function()
              {
                flag = 1;
                hit_t = (new Date()).getTime();
                console.log("hit:"+hit_t);
              });
            }
          }
          motor1.stop();
        }
        if (randnum == 2)//button2, servo 1
        {
          console.log("but2");
          servo1.to(90, 150);
          var lts = (new Date()).getTime();
          hit_t = beats[ptr] - h_t;
          flag = 0;
          while ((new Date()).getTime() - lts < 700)
          {
            if (flag == 0)
            {
              button2.on("press", function()
              {
                flag = 1;
                hit_t = (new Date()).getTime()
                console.log("hit");
              });
            }
          }
          servo1.to(0, 150);
        }
        if (randnum == 3)//button3, servo 2
        {
          console.log("but3");
          servo2.to(90, 150);
          var lts = (new Date()).getTime();
          hit_t = beats[ptr] - h_t;
          flag = 0;
          while ((new Date()).getTime() - lts < 700)
          {
            if (flag == 0)
            {
              button3.on("press", function()
              {
                flag = 1;
                hit_t = (new Date()).getTime()
                console.log("hit");
              });
            }
          }
          servo2.to(0, 150);
        }
        if (randnum == 4)//button4, motor 2
        {
          console.log("but4");
          motor2.start(150);
          var lts = (new Date()).getTime();
          hit_t = beats[ptr] - h_t;
          flag = 0;
          while ((new Date()).getTime() - lts < (2 * h_t))
          {
            if (flag == 0)
            {
              button4.on("press", function()
              {
                flag = 1;
                hit_t = (new Date()).getTime()
                console.log("hit4:"+flag+" "+hit_t);
              });
            }
          }
          motor2.stop();
        }
        //judge
        if (hit_t >= beats[ptr] - d_per && hit_t <= beats[ptr] + d_per)
          marking.push(0);//perfect
        else if (hit_t >= beats[ptr] - d_grt && hit_t <= beats[ptr] + d_grt)
          marking.push(1);//great
        else
          marking.push(2);//miss
        console.log(marking[ptr]);
        ++ptr;
      }
      else
        console.log("error");
    }
  }
  if (status == 2) //Conclude
  {
    status = 3;
    var cur_combo = 0;
    for (var i = 1; i < ptr; ++i)
    {
      if (marking[i] == 2) //miss
      {
        ++miss;
        if (max_combo < cur_combo)
          max_combo = cur_combo;
        cur_combo = 0;
      }
      else
      {
        ++cur_combo;
        if (marking[i] == 1)//great
          ++great;
        else
          ++perfect;
      }
    }
    if (max_combo < cur_combo)
      max_combo = cur_combo;
    console.log("P: " + perfect);
    console.log("G: " + great);
    console.log("M: " + miss);
    console.log("COMBO: " + max_combo);
  }
  this.wait(10, function(){});

});