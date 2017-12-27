var WebPageTest =  require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org', 'A.b930dc40dc389c6ef8f92a9feaf1541d');

nodemailer = require('nodemailer');

function runTest(callback) {
  wpt.runTest('https://www.myntra.com', {
    connectivity: '3GFast',
    location: 'Dulles_MotoG4:Moto G4 - Chrome',
    firstViewOnly: false,
    runs: 1,
    pollResults: 10,
    video: true
  }, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Load time:', result.data.average.firstView.loadTime)
    console.log('First byte:', result.data.average.firstView.TTFB)
    console.log('Start render:', result.data.average.firstView.render)
    console.log('Speed Index:', result.data.average.firstView.SpeedIndex)
    console.log('DOM elements:', result.data.average.firstView.domElements)
    console.log('(Doc complete) Requests:', result.data.average.firstView.requestsDoc)
    console.log('(Doc complete) Bytes in:', result.data.average.firstView.bytesInDoc)    
    console.log('(Fully loaded) Time:', result.data.average.firstView.fullyLoaded)
    console.log('(Fully loaded) Requests:', result.data.average.firstView.requestsFull)
    console.log('(Fully loaded) Bytes in:', result.data.average.firstView.bytesIn)
    console.log('Waterfall view:', result.data.runs[1].firstView.images.waterfall)

    var reportToSend = {
      loadTime: result.data.average.firstView.loadTime,
      firstByte: result.data.average.firstView.TTFB,
      startRender: result.data.average.firstView.render,
      speedIndex: result.data.average.firstView.SpeedIndex,
      domElements: result.data.average.firstView.domElements,
      docCompleteRequests: result.data.average.firstView.requestsDoc,
      docCompleteBytes: result.data.average.firstView.bytesInDoc,
      fullyLoadedTime: result.data.average.firstView.fullyLoaded,
      fullyLoadedRequests: result.data.average.firstView.requestsFull,
      fullyLoadedBytes: result.data.average.firstView.bytesIn,
      waterfallView: result.data.runs[1].firstView.images.waterfall
    }

    sendReportInMail(reportToSend, callback);
  });

}


function sendReportInMail(reportToSend, callback) {
  // Generate test SMTP service account from ethereal.email
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'webperfarchive@gmail.com',
      pass: 'webperfarchivemyntra'
    }
  });

  var perfReport = '<ul>';
  for( var key in reportToSend) {
    perfReport += `<li> ${key} : ${reportToSend[key]} </li>`
  }
  perfReport += '</ul>'

  perfReport+= `<div><b> The waterfall view :- </b></div>`;
  perfReport+= `<img src=${reportToSend.waterfallView}> </img>`

  var htmlReport = `<div><div>Hello The Performance report generated on ${new Date()} is -  </div><br/><br/>${perfReport}</div>`
  
  let mailOptions = {
      from: '"WebPerf Reporter 👻" <webperfarchive@gmail.com>', // sender address
      to: 'sachin.chopra2211@gmail.com', // list of receivers
      subject: 'Myntra Web Performance Report', // Subject line
      text: 'Myntra Web Performance Report', // plain text body
      html: htmlReport // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
        callback(error, null);
        return;
      }
      console.log('Message sent: %s', info.messageId);
      callback(null, info.messageId);
  });
}


// The Lambda Function Handler
exports.handler = function startTestingAndReporting(event, context, callback) {
  console.log("Starting to generarte webpage test report", new Date());  
  runTest(callback);
}