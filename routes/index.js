
/*
 * GET home page.
 */

exports.index = function(req, res){
  var request = require('request')
   ,  cheerio =require('cheerio')
   ,  fs = require('fs')
   ,  json2csv = require('json2csv')
   ,  date = new Date()
   ,  mainArr = []
   ,  uI
   ,  commentURL
   ,  json = []
   ,  headerData = { 
	    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
	  }
   , searchUrl = req.body.search
   , requestURL = getUrl(searchUrl);

  function getUrl(searchTerms){
  	var searchTermsFormatted = searchTerms.replace(/\W/g,'_');
  	var url = "http://www.alibaba.com/corporations/"+ searchTermsFormatted +"/------------------GGS--50.html";
  	return url;
  }

  function saveFile(file) {

  	var tempVar = 'before callback';
  	json2csv({data: file, fields: ['Name', 'Industry', 'Website', 'Contact Person', 'Phone Numbers', 'City']}, function(err, csv) {
		  if (err) console.log(err);
		  tempVar = csv;
		  return tempVar
  	});
  	return tempVar;
  } 
  
  


  function first() {
  	request({url: requestURL, headers: headerData}, function(err, resp, body) {
  		console.log("1st success")
		if (!err && resp.statusCode == 200) {
			console.log("2nd success")
			var $ = cheerio.load(body);
			$('div.ls-icon.ls-item', '#J-items-content').each(function(){
				var url = $('div.corp h2.title.ellipsis a', this).attr('href')
				,  title = $('div.corp h2.title.ellipsis a', this).html()
				,  contactLink = $('div.company a.cd.dot-company', this).attr('href')
				,  industry = $('div.right div.attrs div.attr div.value.ellipsis.ph', this).attr('title')
				,  arr = []
				,  jsonRow = {'Name': '', 'Industry':'', 'Website':'', 'ContactPerson': '', 'PhoneNumbers':'', 'City':''};

				arr.push(title);
				arr.push(industry);
				arr.push('<a href="' + url + '"></a>');
				arr.push(contactLink);

				jsonRow['Name'] = title.replace('<font>', '').replace('<b>', '').replace('</font>','').replace('</b>', '');
				jsonRow['Industry'] = industry.replace('<font>', '').replace('<b>', '').replace('</font>','').replace('</b>', '');
				jsonRow['Website'] = url;

				json.push(jsonRow);

				mainArr.push(arr);
			});
			console.log(mainArr.length);
			if (mainArr.length>0){
				second();
			} else {
				res.render('noresults');
			}
			
		} else {
			console.log("error : " + resp.statusCode);
		}
  	});
  }
  
  function second() {
  	var t = mainArr.length*(mainArr.length+1)/2;
  	for (var i = mainArr.length - 1; i >= 0; i--) {
	  	uI = mainArr[i].length - 1;
		commentURL = mainArr[i][uI];
	  	
	  	var foo = commentURL;	

	  	function modifyArray(itt, secItt) {
		  	request({url: foo, headers: headerData}, function(err, resp, body) {
		  	 	var $ = cheerio.load(body);
		  	 	var contactPersonName = $('h1.name', '#contact-person').html()
		  	 	 ,  contactDetails = $('.contact-detail dl.dl-horizontal','#contact-person').html();
		  	 	
		  	 	if (contactPersonName != null && typeof contactPersonName != undefined) {
			  	 	contactPersonName = contactPersonName.replace(/\n/g, '').replace(/\t/g,'');
			  	};
		  	 	 // reformat horrible html
		  	 	if (typeof contactDetails != undefined && contactDetails != null) {
		  	 		var contactDetailsArray = contactDetails.split('<dt>');
		  	 		for (var j = contactDetailsArray.length - 1; j >= 0; j--) {
		  	 			contactDetailsArray[j] = contactDetailsArray[j].replace('<dd>', '').replace('</dd>', '').replace('</dt>', '').replace(/\n/g, '').replace(/\t/g,'');

		  	 		};
		  	 		var contactDetailsObject = {};
		  	 		for (var k = 1; k < contactDetailsArray.length; k++) {
		  	 			var pair = contactDetailsArray[k].split(':');
		  	 			contactDetailsObject[pair[0]] = pair[1];
		  	 		};
		  	 	};

		  	 	json[itt]['ContactPerson'] = contactPersonName;
		  	 	json[itt]['PhoneNumbers'] = 'Phone: '+ contactDetailsObject['Telephone'] + " " + "Mobile: "+contactDetailsObject['Mobile Phone'];
				json[itt]['City'] = contactDetailsObject['City'];

		  	 	mainArr[itt][secItt] = contactPersonName;
		  	 	mainArr[itt].push('Phone: '+ contactDetailsObject['Telephone'] + " " + "Mobile: "+contactDetailsObject['Mobile Phone']);
		  	 	mainArr[itt].push(contactDetailsObject['City']);

		  	 	

		  	 	t-=itt+1;
		  	 	console.log(t);
		  	 	if (t===0) {

		  	 		var csvTemp = saveFile(json);
			   		res.render('index', {title: "Scraper",
										 data: mainArr,
										 csvData: json,
										 searchTerms: searchUrl,
										 csv: csvTemp
										});
				};
		  	 	

		  	});
		  	
		}

		modifyArray(i,uI);
		
	};
	

  }
  
  first();
  


};