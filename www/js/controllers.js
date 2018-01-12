/* global angular, document, window */
'use strict';

var defaulturl = 'app.home';
//var URL_PREFIX = 'http://localhost:8888';
var URL_PREFIX = 'http://1-dot-ksmserv-154723.appspot.com';
// Appointment status
var STATUS_LEAVE = -1;
var STATUS_PENDING = 0;
var STATUS_APPROVE = 1;
var STATUS_REFUSE = 2;
var STATUS_CANCEL = 3;
var STATUS_CONFIRM = 4;
var STATUS_VISIT = 5;

angular.module('starter.controllers', ['ionic','ionic.cloud'])

.factory('methodFactory', function () {
    return { reset: function () {
            console.log("methodFactory - reset");
			window.localStorage.setItem('user', null);
    }
}})


.controller('AppCtrl', function($scope,$rootScope,$ionicPopup, $ionicModal,$ionicLoading, $ionicPopover, $timeout,$state,$http, $cordovaCamera) {
    // Form data for the login modal
	console.log("AppCtrl is called");
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
	
	// record consumption
	 $scope.newConsumptionRecord = function(){
      $state.go('app.recordConsumption') ;
    }
	// take photo for image recognition
	$scope.takeImage = function() {
      console.log("takeImage called");
        var options = {
            quality: 80,
            destinationType: Camera.DestinationType.DATA_URL,
            //sourceType: Camera.PictureSourceType.CAMERA,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 800,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
          console.log("getPicture called");
          $rootScope.imageData = imageData;
          $state.go("app.recordConsumption");
      
        }, function(err) {
            console.log(err);
            $ionicLoading.hide();
        });
      }
	  
	 $rootScope.$on('cloud:push:notification', function(event, data) {
		var msg = data.message;
		//$rootScope.messages = window.localStorage.getItem("messages");
		//$rootScope.messages.push(msg);
		//window.localStorage.setItem("messages", $scope.messages);
		//alert("message "+msg.title + ': ' + msg.text);
		console.log("message "+msg.title + ": " + msg.text);
		 var alertPopup = $ionicPopup.alert({
			 title: msg.title,
			 template: msg.text
		  });
		  
		//$scope.messages = msg;
	});
	
	// query news and promotion
	$scope.$on('news:updated', function(event,symptomList) {
		$scope.news = [];
		$scope.promotion = [];
		$scope.urlprefix = URL_PREFIX;
		if(symptomList != null && symptomList.length >0){
			for(var i=0;i<symptomList.length;i++){
				$ionicLoading.show();
				$http.get(URL_PREFIX+"/listNewsByTargetAndLevelWS.do?target="+symptomList[i].symptomName+"&&level="+symptomList[i].symptomlevel)
				.then(function(res){
				//	console.log(JSON.stringify(res.data));
					$scope.news = $scope.news.concat(res.data);
					$ionicLoading.hide();
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
				});
			}
			
			for(var i=0;i<symptomList.length;i++){
				$ionicLoading.show();
				$http.get(URL_PREFIX+"/listPromotionByTargetAndLevelWS.do?target="+symptomList[i].symptomName+"&&level="+symptomList[i].symptomlevel)
				.then(function(res){
			//		console.log(JSON.stringify(res.data));
					$scope.promotion = $scope.promotion.concat(res.data);
					$ionicLoading.hide();
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
				});
			}
		}
	});
	//$state.go("app.login");
})

.controller('LoginCtrl', function($scope,$rootScope, $state, $timeout,$ionicPush, $ionicSideMenuDelegate, $stateParams, ionicMaterialInk, $location, $http, $cordovaOauth, $ionicLoading, $ionicPopup) {

	var uObj = window.localStorage.getItem('user');
    console.log('LoginCtrl - Existing user: '+window.localStorage.getItem('user'));
     $timeout(function() {
		if(uObj != 'null'){
				  console.log('this user alraldy login so go to homepage : authorizationKey = '+JSON.parse(uObj).authorizationKey);
				  $http.defaults.headers.common['___authorizationkey'] = JSON.parse(window.localStorage.getItem('user')).authorizationKey;
				  $state.go(defaulturl);
				  return;
		 }
	}, 100);
	$scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
   }, 0);
	$ionicSideMenuDelegate.canDragContent(false);
    ionicMaterialInk.displayEffect();
	
	$scope.formData = {};
	$scope.ksmLogin = function() {
		$ionicLoading.show();
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/loginPatientWS.do",JSON.stringify($scope.formData),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				//console.log("xxx"+JSON.stringify(data));
				if(data != ''){
					window.localStorage.setItem('user',JSON.stringify(data));
					
					// Get Device Token Key 
					$ionicPush.register().then(function(t) {
							console.log('Saving token');
							return $ionicPush.saveToken(t);
					}).then(function(t) {
						// Update the latest token key of the user			
						$http.get(URL_PREFIX+"/updateDeviceTokenKeyOnSpecificUser.do?tokenKey="+t.token+"&userKey="+data.keyString)
							.then(function(res) {
								console.log('Update Device Token for '+data.keyString+' success');
							}, function(err) {
								console.error('ERR', JSON.stringify(err));
							}
						); 
						
						console.log('Token saved:', t.token);
					});

					$state.go(defaulturl);
					// set header for authorization key
					$http.defaults.headers.common['___authorizationkey'] = data.authorizationKey;
				}else{
					 var alertPopup = $ionicPopup.alert({
					 title: 'Security Alert',
					 template: 'Invalid Username/Password, Please try to login again'
					});

					alertPopup.then(function(res) {
				
					});
				}
				
			}).
			error(function(data, status, headers, config) 
			{
				console.log("error"+JSON.stringify(data));
				$ionicLoading.hide();
			});
	
	}
	
	$scope.ksmRegister = function() {
		$state.go("app.register");
	}
	
})

.controller('RegisterCtrl', function($scope, $stateParams,$state,$ionicSideMenuDelegate, $timeout,$http,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicSideMenuDelegate.canDragContent(false);
	 $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
	$scope.formData ={};
	$scope.submit = function() {
		if (!$scope.formData.username.match(/^[0-9a-z]+$/) || !$scope.formData.password.match(/^[0-9a-z]+$/)){
			var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'Username และ Password ต้องประกอบไปด้วยตัวเลข ตัวอักษร A-Z ตัวเล็กหรือตัวใหญ่ เท่านั้น'
					});
			alertPopup.then(function(res) {});
			return;
		}

		$ionicLoading.show();
		$scope.formData.role = 'patient';
		$scope.formData.status = 0;
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/registerPatientUserWS.do",JSON.stringify($scope.formData),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				console.log("success: "+data);
				if(data == "-3"){
					 var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'Username มีผู้ใช้แล้ว <BR/>โปรดใส่ username ใหม่'
					});
					alertPopup.then(function(res) {});
					
				} else if(data == "-4"){
					 var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'รหัสคนไข้(HN) มีผู้ใช้งานอยู่แล้ว <BR/>โปรดใส่รหัสใหม่ หรือ ปล่อยว่างเพื่อสร้างบัญชีผู้ใช้ชั่วคราว'
					});
					alertPopup.then(function(res) {});
					
				} else if(data == "-1") {
					var alertPopup = $ionicPopup.alert({
					 title: 'Registration Fail',
					 template: 'ระบบเกิดความผิดพลาดในระหว่างการลงเบียน โปรดลงทะเบียนใหม่'
					});

					alertPopup.then(function(res) {});
				} else {
					var alertPopup = $ionicPopup.alert({
					 title: 'Registration Success',
					 template: 'การลงทะเบียนสำเร็จ โปรดเข้าระบบด้วย Username และ Password ที่ตั้งไว้'
					});

					alertPopup.then(function(res) {
					 $state.go('app.login');
					});
					//$state.go('app.login');
				}

			}).
			error(function(data, status, headers, config) 
			{
				console.log("error: "+data);
				$ionicLoading.hide();
				
				
			});
	}
	
  
})

.controller("LogoutCtrl",function($scope,$state, $ionicLoading,methodFactory) {
	
		console.log("LogoutCtrl called");
		methodFactory.reset();		
		$state.go('app.login');
		
		
})

.controller('PatientRecordCtrl', function($ionicNavBarDelegate,$scope, $stateParams, $timeout, $state,methodFactory, $http,$filter,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicNavBarDelegate.showBackButton(true);

    var userObj = JSON.parse(window.localStorage.getItem('user'));
	$ionicLoading.show();
	var headers = { 'Content-Type':'application/json' };
	$http.get(URL_PREFIX+"/searchPatientByHospitalNumberWS.do?hospitalNumber="+userObj.codeHN)
				.then(function(res){ 
					$ionicLoading.hide();
					console.log(JSON.stringify(res.data));
					$scope.patientRecord = res.data;
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
				}); 
	$ionicLoading.show();
	$http.get(URL_PREFIX+"/getLatestVitalSignWS.do?codeHN="+userObj.codeHN)
				.then(function(res){ 
					$ionicLoading.hide();
					console.log("#"+res.data+"#");
					if(res.data != "")
						$scope.vitalSignRecord = res.data;
					else
						$scope.vitalSignRecord = {};
						$scope.vitalSignRecord.codeHN = userObj.codeHN;
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
				}); 
	
	$scope.submit = function(){
		$ionicLoading.show();
		var headers = { 'Content-Type':'application/json' };
		delete $scope.patientRecord.key;
		delete $scope.patientRecord.appId
		delete $scope.patientRecord.patientId
		console.log("Saving "+JSON.stringify($scope.patientRecord));
		
		$http.post(URL_PREFIX+"/savePatientWS.do",JSON.stringify($scope.patientRecord),headers).
				success(function(data, status, headers, config) 
				{
					console.log("save result"+JSON.stringify(data));
					delete $scope.vitalSignRecord.keyString;
					delete $scope.vitalSignRecord.key;
					console.log("Saving "+JSON.stringify($scope.vitalSignRecord));
					var headers = { 'Content-Type':'application/json' };
					$http.post(URL_PREFIX+"/recordVitalSignWS.do",JSON.stringify($scope.vitalSignRecord),headers).
					success(function(data, status, headers, config) 
					{
						$ionicLoading.hide();
						console.log("save result"+JSON.stringify(data));
						
						$state.go(defaulturl);
						
					}).
					error(function(data, status, headers, config) 
					{
						console.log("error"+JSON.stringify(data));
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Please try again!',
							template: 'Error occurred during saving'
						});
					});
				}).
				error(function(data, status, headers, config) 
				{
					console.log("error"+JSON.stringify(data));
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Please try again!',
						template: 'Error occurred during making appointment'
					});
				});
	}
})

.controller('HomeCtrl', function($scope,$rootScope, $ionicHistory,$ionicNavBarDelegate,$ionicSideMenuDelegate, $stateParams,$ionicPopup, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {

	// Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicNavBarDelegate.showBackButton(false);
	$ionicSideMenuDelegate.canDragContent(true);
	//$ionicHistory.clearHistory();
    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.ripple(
		{
            selector: '.ripple'
        });
    }, 300);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	$ionicLoading.show();
	//var headers = { 'Content-Type':'application/json' };
	console.log(userObj.authorizationKey);
	var headers = new Headers();
	headers.append('___authorizationkey', userObj.authorizationKey);

	$http({
					method: 'GET',
					url: URL_PREFIX+"/getLatestVitalSignWS.do?codeHN="+userObj.codeHN,
				})
				.then(function(res){ 
					$ionicLoading.hide();
					
					if(Object.keys(res.data).length != 0){
						console.log("vitalsign: "+JSON.stringify(res.data));
						$scope.bodyHeight = res.data.measures.bodyHeight;
						$scope.bodyWeight = res.data.measures.bodyWeight;
						$scope.temperature = res.data.measures.temperature;
						$scope.bpSystolic = res.data.measures.bpSystolic;
						$scope.bpDiastolic = res.data.measures.bpDiastolic;
						$scope.respitoryRate = res.data.measures.respitoryRate;
						$scope.pulseRate = res.data.measures.pulseRate;
						var measures = [];
						for (var p in res.data.measures) {
							if( res.data.measures.hasOwnProperty(p) ) {
								measures.push({key:p,value:res.data.measures[p]});
							}
						}            
						$scope.measures = measures;
						console.log("measures:"+JSON.stringify(measures));
						$scope.updateDate = res.data.updateDate;
						$scope.bmi = Math.round(res.data.bmi);
						$scope.bodyAnalysis = res.data.bodyAnalysis;
						$scope.bpAnalysis = res.data.bpAnalysis;
						$scope.ree = res.data.ree;

					} else {
						$scope.bodyHeight = "00";
						$scope.bodyWeight = "00";
						$scope.temperature = "00";
						$scope.bpSystolic = "000";
						$scope.bpDiastolic = "000";
						$scope.updateDate = "N/A";
						$scope.bmi = "N/A";
						$scope.bodyAnalysis = "N/A";
						$scope.bpAnalysis = "N/A";
					}
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
				}); 
				
	$ionicLoading.show();
	var headers = { 'Content-Type':'application/json' };
	$http.get(URL_PREFIX+"/searchPatientByHospitalNumberWS.do?hospitalNumber="+userObj.codeHN)
				.then(function(res){ 
					$ionicLoading.hide();
					console.log(JSON.stringify(res.data));
					if(Object.keys(res.data).length != 0){
						if(res.data.bloodGroup == "None" || res.data.bloodRH == "None"){
							$scope.bloodGroup = "N/A"
							$scope.bloodRH = "N/A"
						}else{
							$scope.bloodGroup = res.data.bloodGroup;
							$scope.bloodRH = res.data.bloodRH;
						}
						$scope.patientKey = res.data.keyString;
			
					} else {
						$scope.bloodGroup = "N/A";
						$scope.bloodRH = "N/A";
					}
				}
				, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
				}); 
				
	// query lifestyle activities
	$scope.lifestyleSeries = ["ทำงาน", "ออกกำลัง", "นอนหลับ"];
    $scope.lifestyleLabels = [];
    $scope.lifestyleData = [];
	$scope.nutritionSeries = ['บริโภคจริง','ควรบริโภค'];
	$scope.nutritionLabels = [];
	$scope.nutritionData = [];
	$scope.lifestyleOptions = {animation : false,legend: {display: true,position:'bottom'},scaleLabel: { fontColor: '#ffffff'}};
	$scope.loadingLifeStyleData = true;
	$http.get(URL_PREFIX+"/getLifeStyleConsumptionWeeklyWS.do?codeHN="+userObj.codeHN)
	.then(function(res) 
	{
		console.log("weekly: "+JSON.stringify(res.data));
		
		// pass in lifestyle summary
		var excerciseNumber = 0;
		if(res.data != ""){
			for(var name in res.data.lifestyle) {
				var value = res.data.lifestyle[name];
				if(name == "rdate"){
					var dateLabels = [];
					for(var i=0;i<value.length;i++){
						console.log("rdate: "+value[i]);
						dateLabels.push($filter('date')(new Date(value[i]), "dd/MM"));
					}
					$scope.lifestyleLabels = dateLabels;
				} else{
				
					$scope.lifestyleData.push(value);
				}
			}
		}
		
		// pass in consumption summary
		var intakelist = [];
		  var limitlist = [];
		  if(res.data.consumption.length>0){
			  for(var i=4; i>=0; i--){
				var cdate = new Date(res.data.consumption[i].consumptionTime);
				$scope.nutritionLabels.push($filter('date')(cdate, "dd/MM"));
				intakelist.push(res.data.consumption[i].calories);
				limitlist.push(res.data.consumption[i].caloriesLimit);
			  }
		  } 
		  $scope.nutritionData.push(intakelist);
		  $scope.nutritionData.push(limitlist);
		
		//console.log($scope.lifestyleSeries);
		//console.log($scope.lifestyleLabels);
		//console.log($scope.lifestyleData);
		$scope.loadingLifeStyleData = false;
	}
	, function(err) {
			$scope.loadingLifeStyleData = false;
			console.error('ERR', JSON.stringify(err));
	}); 
	

	$scope.loadingSymptomData = true;
	$http.get(URL_PREFIX+"/getSymptomByPatientWS.do?codeHN="+userObj.codeHN)
    .then(function(res){
        console.log(res.data);
        $scope.symptomList = [];
        for(var i=0; i<res.data.length; i++){
          var symptomObj = res.data[i];
		  symptomObj.probability = Math.round(symptomObj.probability * 100);
          $scope.symptomList.push(symptomObj);
        }
		window.localStorage.setItem('symptomList',JSON.stringify($scope.symptomList));
		$rootScope.$broadcast('news:updated',$scope.symptomList);
		
		$scope.loadingSymptomData = false;
    }, function(err) {
        console.error('ERR', JSON.stringify(err));
        $scope.loadingSymptomData = false;
    });
	
	$ionicLoading.show();
	var today = new Date();
	$scope.totalApt = "0";
	$scope.totalVisit = "0";
	// get all appointment from today
	var headers = { 'Content-Type':'application/json' };
	$http.get(URL_PREFIX+"/findAppointmentByPatientWS.do?codeHN="+userObj.codeHN+"&fromDate="+ ($filter('date')(today, "yyyy-MM-dd")))
			.then(function(res) 
			{
				//console.log(JSON.stringify(res.data));
				if(res.data.length > 0){
					// get next appointment
					//console.log(JSON.stringify(res.data[0]));
					$scope.totalApt = 0;
					$scope.totalVisit = 0;
					for(var i=0; i<res.data.length; i++ ){
						if(res.data[i].status == STATUS_VISIT){
							$scope.totalVisit++;
						}else if(res.data[i].status == STATUS_PENDING || res.data[i].status == STATUS_APPROVE || res.data[i].status == STATUS_CONFIRM){
							$scope.totalApt++;
							if($scope.nextApt == undefined)
								$scope.nextApt = res.data[i];
						}
						
					}
					if($scope.nextApt == undefined){
						$scope.hasApt = false;
					}else{
						var nextAptDateTime = new Date();
						$scope.hasApt = true;
						nextAptDateTime.setTime($scope.nextApt.startTimeLongValue);
						var today = new Date();
						$scope.dayDiff = Math.round((nextAptDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
						if($scope.dayDiff == 0)
							$scope.aptTxt = "วันนี้";
						else if($scope.dayDiff == 1)
							$scope.aptTxt = "พรุ่งนี้";
						else
							$scope.aptTxt = $scope.dayDiff + " วัน";
						if($scope.nextApt.preferChoice == 1){
							$scope.nextAptTime = $scope.nextApt.preferTime1;
						}else if($scope.nextApt.preferChoice == 2){
							$scope.nextAptTime = $scope.nextApt.preferTime1;
						}
						
						$scope.nextAptDate = $filter('date')(nextAptDateTime, "dd-MM-yyyy");
						
					}
					
					
				} else {
					$scope.hasApt = false;
					$scope.totalApt = "0";
				}
				$ionicLoading.hide();
				
			}
			, function(err) {
					console.error('ERR', JSON.stringify(err));
					$ionicLoading.hide();

					$scope.totalApt = "0";
					
					if(reloadHelper == 1){
					var alertPopup = $ionicPopup.alert({
					 title: 'Warning',
						template: 'No intenet connection.'
					});
					reloadHelper = 2;
					}
			}); 
	// query visited appointment
	$http.get(URL_PREFIX+"/findAppointmentByPatientWS.do?codeHN="+userObj.codeHN+"&status=5")
	.then(function(res) 
	{
		$scope.totalVisit = res.data.length;
	}
	, function(err) {
			console.error('ERR', JSON.stringify(err));
	}); 
	
	
	
	
})

.controller('ConsumptionCtrl', function($scope,$ionicHistory, $ionicNavBarDelegate, $stateParams,$cordovaCamera, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
  console.log("ConsumptionCtrl is called "+$stateParams.cdate);

  // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;

    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(true);
    $ionicNavBarDelegate.showBackButton(true);

	var userObj = JSON.parse(window.localStorage.getItem('user'));
	console.log("userObj "+JSON.stringify(userObj));

    var today = new Date();
    if($stateParams.cdate != null && $stateParams.cdate != "" )
      today = new Date($stateParams.cdate);
    var tomorrowDate = new Date(today.getTime()+1000*60*60*24);
    var yesterdayDate = new Date(today.getTime()-1000*60*60*24);
    $scope.todayTxt = $filter('date')(today, "EEEE dd MMMM yyyy");
    $scope.yesterday = $filter('date')(yesterdayDate, "yyyy-MM-dd");
    $scope.tomorrow = $filter('date')(tomorrowDate, "yyyy-MM-dd");
    $scope.todate = $filter('date')(today, "yyyy-MM-dd");
	
    $ionicLoading.show();
    $http.get(URL_PREFIX+"/listConsumptionWS.do?patientKey="+userObj.keyString+"&date="+$filter('date')(today, "yyyy-MM-dd"))
  		.then(function(res){
  				$ionicLoading.hide();
  				$scope.cList = res.data;
          $scope.totalCalories = 0;
          $scope.breakfastCalories = 0;
          $scope.lunchCalories = 0;
          $scope.dinnerCalories = 0;
          $scope.snackCalories = 0;
          for(var i=0; i<res.data.length; i++){
            $scope.totalCalories+=res.data[i].calories;
            if(res.data[i].mealType == 'breakfast')
                $scope.breakfastCalories += res.data[i].calories;
            else if(res.data[i].mealType == 'lunch')
                $scope.lunchCalories += res.data[i].calories;
            else if(res.data[i].mealType == 'dinner')
                $scope.dinnerCalories += res.data[i].calories;
            else if(res.data[i].mealType == 'snack')
                $scope.snackCalories += res.data[i].calories;
          }

  		}, function(err) {
  				console.error('ERR', JSON.stringify(err));
  				$ionicLoading.hide();
  		});

})

.controller('listConsumptionCtrl', function($scope,$rootScope,$ionicNavBarDelegate,$ionicSideMenuDelegate, $stateParams,$ionicLoading, $http) {
  console.log("listConsumptionCtrl called "+$stateParams.mealtype+" "+$stateParams.cdate);
  $ionicNavBarDelegate.showBackButton(true);
  if($stateParams.mealtype == undefined || $stateParams.mealtype == '')
    $stateParams.mealtype =   $rootScope.mealtype;
  else
    $rootScope.mealtype = $stateParams.mealtype;

  if($stateParams.cdate == undefined || $stateParams.cdate == '')
    $stateParams.cdate =   $rootScope.cdate;
  else
    $rootScope.cdate = $stateParams.cdate;

  $scope.mealtype = $stateParams.mealtype;
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = false;
  $scope.$parent.setExpanded(false);
  $scope.$parent.setHeaderFab(false);

  var userObj = JSON.parse(window.localStorage.getItem('user'));
  $scope.load = function() {
    $ionicLoading.show();
    $http.get(URL_PREFIX+"/listConsumptionWS.do?patientKey="+userObj.keyString+"&mealType="+$stateParams.mealtype+"&date="+$stateParams.cdate)
      .then(function(res){
          $ionicLoading.hide();
          $scope.cList = res.data;
      }, function(err) {
          console.error('ERR', JSON.stringify(err));
          $ionicLoading.hide();
      });
    }
     $ionicLoading.show();
   $scope.delItem = function(item){
     console.log("deleting "+item.keyString);
     $http.get(URL_PREFIX+"/deleteConsumptionWS.do?key="+item.keyString)
       .then(function(res){

           $ionicLoading.hide();
           $scope.load();
       }, function(err) {
           console.error('ERR', JSON.stringify(err));
           $ionicLoading.hide();
       });

   }

    $scope.load();


})

.controller('RecordConsumptionCtrl', function($scope,$state,$rootScope, $timeout,$ionicHistory,$filter, $stateParams,$http,$ionicLoading) {
  console.log("RecordConsumptionCtrl called x"+$rootScope.mealtype+" "+$rootScope.cdate);
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = false;
  $scope.$parent.setExpanded(false);
  $scope.$parent.setHeaderFab(false);

  var userObj = JSON.parse(window.localStorage.getItem('user'));
  var headers = { 'Content-Type':'application/json' };
  $scope.searchFood = function(keyword){
    console.log("searching "+keyword);
    $ionicLoading.show();
    $http.get(URL_PREFIX+"/searchFoodWS.do?keyword="+keyword)
      .then(function(res){
          $ionicLoading.hide();
          $scope.resultList = res.data;
          $scope.keyword = keyword;
          $scope.selectFood = 'true';
          $scope.recordFood = 'false';
      }, function(err) {
          console.error('ERR', JSON.stringify(err));
          $ionicLoading.hide();
      });
  }

  $scope.newRecord = function(selectedItem){
      $scope.selectFood = 'false';
      $scope.recordFood = 'true';
      $scope.selectedItem = selectedItem;
      $scope.selectedFood  = {}
      $scope.selectedFood.foodName = selectedItem.name;
      $scope.selectedFood.foodCode = selectedItem.code;
      $scope.selectedFood.patientKey = userObj.keyString;
      $scope.selectedFood.unitCount = 1;
      $scope.selectedFood.calories = selectedItem.calories * $scope.selectedFood.unitCount;
      $scope.selectedFood.consumptionTime = $rootScope.cdate;
      $scope.selectedFood.mealType = $rootScope.mealtype;

  }

  $scope.toggleResult = function(){
    console.log("toggleResult called");
    $scope.selectFood = 'true';
    $scope.recordFood = 'false';
  }

  $scope.recal = function(){
    $scope.selectedFood.calories =   $scope.selectedItem.calories * $scope.selectedFood.unitCount;
  }

  $scope.submit = function(){


    $ionicLoading.show();
    $scope.selectedFood.consumptionTime +=  " 12:00:00";
    console.log( " record: "+JSON.stringify($scope.selectedFood));
    $http.post(URL_PREFIX+"/recordConsumptionWS.do",JSON.stringify($scope.selectedFood),headers).
			success(function(data, status, headers, config)
			{
				$ionicLoading.hide();
			 //	$state.go("app.listConsumption");
       $ionicHistory.goBack();
			}).
			error(function(data, status, headers, config)
			{
				console.log("error: "+data);
				$ionicLoading.hide();


			});
  }
// check if there image passing in from camera
  if($rootScope.imageData != undefined && $rootScope.imageData !=null){

    // classify with tensorflow
    $ionicLoading.show({template: "Please wait a moment<BR/>We are recognizing your image..."});
    $timeout(function () {
      $rootScope.tf.classify($rootScope.imageData).then(function(results) {
          console.log("Finish classification process");
          if(results.length>0){
          //  $rootScope.predictionResult = results;
            //$state.go("app.recordConsumption");
            var foundFoodKeys = [];
            results.forEach(function(result) {
                  console.log(result.title + " " + result.confidence);
                  foundFoodKeys.push(result.title);
            });
            console.log("find food by keys:"+JSON.stringify(foundFoodKeys));
            $http.post(URL_PREFIX+"/getFoodsByCodeWS.do",JSON.stringify(foundFoodKeys),headers).
        			success(function(data, status, headers, config)
        			{
                console.log("found foods "+JSON.stringify(data));
                $scope.resultList = data;
                $scope.keyword = "";
                $scope.selectFood = 'true';
                $scope.recordFood = 'false';
                $scope.hideSearch = 'true';
                $rootScope.cdate = $filter('date')(new Date(), "yyyy-MM-dd");
                $rootScope.mealtype = "breakfast";
                $ionicLoading.hide();
        			}).
        			error(function(data, status, headers, config)
        			{
        				console.log("error: xxxx"+data+" "+status);
        				$ionicLoading.hide();


        			});
          }
          $ionicLoading.hide();
          $rootScope.imageData = null;
      });
    }, 800);

  }

})

.controller('NewAppointmentCtrl', function($ionicNavBarDelegate,$scope, $stateParams, $timeout, $state,methodFactory, $http,$filter,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	$ionicNavBarDelegate.showBackButton(true);

	$ionicLoading.show();
    var userObj = JSON.parse(window.localStorage.getItem('user'));
    // load specialty
	
	$http.get(URL_PREFIX+"/listSpecialityWS.do").then(function(res) {
		$scope.specialitySelection = [];
		for(var i=0; i<res.data.length; i++){
			$scope.specialitySelection.push({value:res.data[i],selected:false});
		}
		$ionicLoading.hide();
					
		}, function(err) {
		
			console.error('ERR', JSON.stringify(err));
			var cancelPopup = $ionicPopup.alert({
				title: 'Warning',
				template: 'No internet connection'
			});
			
			cancelPopup.then(function(res) {
				$state.go('app.listappointment');
			});
			$ionicLoading.hide();
		}); 
	$scope.formData ={};
	//$scope.formData.preferDate1 = new Date();
	//$scope.formData.preferDate2 = new Date();
	var times = [ "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30",
							"09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
							"11:00 - 11:30", "11:30 - 12:00", "12:00 - 12:30",
							"12:30 - 13:00", "13:00 - 13:30", "13:30 - 14:00",
							"14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30",
							"15:30 - 16:00" ];
	$scope.timeList1 = [];
	$scope.timeList2 = [];
	for(var i=0; i<times.length; i++){
		$scope.timeList1.push({value:times[i],selected:false});
		$scope.timeList2.push({value:times[i],selected:false});
	}
	
	
	$scope.getOptionsSelectedTxt = function(options, valueProperty, selectedProperty){
		//console.log('getOptionsSelectedTxt'+JSON.stringify(options));
		if( typeof options != 'undefined' && options.length>0){
			var optionsSelected = $filter('filter')(options, function(option) {return option[selectedProperty] == true; });
			return optionsSelected.map(function(group){ return group[valueProperty]; }).join(", ");
		} else {
			return '';
		}
		
	};
	
	$scope.submit = function(){
		$ionicLoading.show();
		if($scope.getOptionsSelectedTxt($scope.timeList1, 'value', 'selected') == '' || $scope.getOptionsSelectedTxt($scope.specialitySelection, 'value', 'selected') == ''){
			var alertPopup = $ionicPopup.alert({
				title: 'Warning',
				template: 'Please all required fields'
			});
			$ionicLoading.hide();
			return;
		}
		$scope.formData.preferTime1 = $scope.getOptionsSelectedTxt($scope.timeList1, 'value', 'selected');
		$scope.formData.preferTime2 = $scope.getOptionsSelectedTxt($scope.timeList2, 'value', 'selected');
		$scope.formData.preferDate1 = $filter('date')($scope.formData.preferDate1, "yyyy-MM-dd");
		$scope.formData.preferDate2 = $filter('date')($scope.formData.preferDate2, "yyyy-MM-dd");

		$scope.formData.specialty = $scope.getOptionsSelectedTxt($scope.specialitySelection, 'value', 'selected');
		$scope.formData.status = 0;
		$scope.formData.codeHN = userObj.codeHN;
		console.log(JSON.stringify($scope.formData));
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/makeAppointmentWS.do",JSON.stringify($scope.formData),headers).
				success(function(data, status, headers, config) 
				{
					$ionicLoading.hide();
					console.log("xxx"+JSON.stringify(data));
					if(data == "1"){

						var alertPopup = $ionicPopup.alert({
							title: 'Appointment Submitted',
							template: 'โปรดรอการยืนยันจากเจ้าหน้าที่'
						});

						alertPopup.then(function(res) {
					 		$state.go("app.home");
						});
						
					}else if(data == "-2"){
						var alertPopup = $ionicPopup.alert({
							title: 'Please try again!',
							template: 'วันเวลาที่เลือกไม่ว่าง, โปรดเลือกวันเวลาใหม่'
						});
					}
					else{
						var alertPopup = $ionicPopup.alert({
							title: 'Please try again!',
							template: 'Error occurred during making appointment'
						});
					}

				}).
				error(function(data, status, headers, config) 
				{
					console.log("error"+JSON.stringify(data));
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Please try again!',
						template: 'Error occurred during making appointment'
					});
				});
	}
})

.controller('ListAppointmentCtrl', function($state, $ionicNavBarDelegate,$scope, $stateParams, $rootScope, $timeout,$http,$filter,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(true);

	$ionicNavBarDelegate.showBackButton(true);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	var today = new Date();
	$scope.loadData = function(){
		$http.get(URL_PREFIX+"/findAppointmentByPatientWS.do?codeHN="+userObj.codeHN+"&fromDate="+ ($filter('date')(today, "yyyy-MM-dd")))
				.then(function(res) 
				{
					$scope.appointments = res.data;
					for(var i=0; i<$scope.appointments.length; i++){
					//	if($scope.a)
						var aptDateTime = new Date($scope.appointments[i].startDateTime);
						$scope.appointments[i].startDateTime = aptDateTime;
					}
					//console.log("apppppp "+$scope.appointments);
					$scope.$broadcast('scroll.refreshComplete');
				}, function(err) {
						console.error('ERR', JSON.stringify(err));
				}); 
	}
			
	$scope.cancel = function(aptKey) {
		
		var confirmPopup = $ionicPopup.confirm({
			 title: 'Appointment Cancellation',
			 template: 'คุณกำลังยกเลิกนัด กด OK เพื่อยกเลิก?',
			 cssClass: 'pretty-thai-text',
			 cancelText: 'Back',
			 okText: 'OK'
		});

		confirmPopup.then(function(res) {
			 if(res) {
				$ionicLoading.show();
				var aptObj = {keyString: aptKey};
				var headers = { 'Content-Type':'application/json' };
				console.log(aptKey+" passing in"+JSON.stringify(aptObj));
				$http.post(URL_PREFIX+"/cancelAppointmentWS.do",JSON.stringify(aptObj),headers).
					success(function(data, status, headers, config) 
					{
						$ionicLoading.hide();
						console.log("xxx"+JSON.stringify(data));
						//reload data
						$scope.loadData();
						
					}).
					error(function(data, status, headers, config) 
					{
						console.log("error"+JSON.stringify(data));
						$ionicLoading.hide();
					});
			 } else {
			   console.log('You are not sure');
			 }
		});
	}
	
$scope.editPage = function(aptKey) {
	$rootScope.aptKey = aptKey;
	$state.go('app.editApt');
}
	
	$scope.confirm = function(aptKey) {
		var confirmPopup = $ionicPopup.confirm({
			 title: 'Confirmation',
			 template: 'Are you sure you want to confirm this appointment?',
			okText: 'Sure',
			cancelText : 'Back'
		});

		confirmPopup.then(function(res) {
			 if(res) {
				$ionicLoading.show();
				var aptObj = {keyString: aptKey};
				var headers = { 'Content-Type':'application/json' };
				console.log(aptKey+" passing in"+JSON.stringify(aptObj));
				$http.post(URL_PREFIX+"/confirmAppointmentWS.do",JSON.stringify(aptObj),headers).
					success(function(data, status, headers, config) 
					{
						$ionicLoading.hide();
						console.log("xxx"+JSON.stringify(data));
						//reload data
						$scope.loadData();
						
					}).
					error(function(data, status, headers, config) 
					{
						console.log("error"+JSON.stringify(data));
						$ionicLoading.hide();
					});
			 } else {
			   console.log('You are not sure');
			 }
		});
	}
	
	$scope.loadData();
})

.controller('LifestyleCtrl', function($state, $ionicNavBarDelegate,$scope,$ionicModal, $stateParams, $rootScope, $timeout,$http,$filter,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(true);

	$ionicNavBarDelegate.showBackButton(true);
	var today = new Date();
    if($stateParams.rdate != null && $stateParams.rdate != "" )
      today = new Date($stateParams.rdate);
    var tomorrowDate = new Date(today.getTime()+1000*60*60*24);
    var yesterdayDate = new Date(today.getTime()-1000*60*60*24);
	$scope.yesterday = $filter('date')(yesterdayDate, "yyyy-MM-dd");
    $scope.tomorrow = $filter('date')(tomorrowDate, "yyyy-MM-dd");
    $scope.todayTxt = $filter('date')(today, "EEEE dd MMMM yyyy");
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	
	$scope.loadData = function(){
		$ionicLoading.show();
		$http.get(URL_PREFIX+"/geLifeStyleByDateWS.do?codeHN="+userObj.codeHN+"&rdate="+ ($filter('date')(today, "yyyy-MM-dd")))
				.then(function(res) 
				{
					$scope.lifestyleLabel = [];
					$scope.lifestyleData = [];
					$scope.lifestyleOptions = {legend: {display: true, position:'bottom'},scaleLabel: { fontColor: '#ffffff'}};
					var totaltrackhour = 0;
					if(res.data!=""){
						console.log(res.data)
						
						for(var name in res.data.measures){
							var value = res.data.measures[name];
							$scope.lifestyleLabel.push(name);
							$scope.lifestyleData.push(value);
							totaltrackhour+=Number(value);
						}
						
						
					}
					if(totaltrackhour<24){
							$scope.lifestyleLabel.push("No Record");
							$scope.lifestyleData.push(24-totaltrackhour);
					}
					$ionicLoading.hide();
					console.log(JSON.stringify($scope.lifestyleData));
				}, function(err) {
						$ionicLoading.hide();
						console.error('ERR', JSON.stringify(err));
				}); 
	}
	
	//$rootScope.activitySelection = [{name:"นอน",value:"sleep"},{name:"เดิน",value:"walking"},{name:"วิ่ง",value:"running"}];
	$ionicLoading.show();
	$http.get(URL_PREFIX+"/listActivityTypeWS.do")
				.then(function(res) 
				{
					console.log("acttype: "+res.data);
					$rootScope.activitySelection = [];
					for(var i=0; i<res.data.length;i++){
						$rootScope.activitySelection.push({name: res.data[i].description, value:res.data[i].typeCode});
					}
					$ionicLoading.hide();
				}, function(err) {
						console.error('ERR', JSON.stringify(err));
						$ionicLoading.hide();
				}); 
	 $ionicModal.fromTemplateUrl('templates/recordLifeStyle.html', {
		  scope: $scope,
		  animation: 'slide-in-up',
	   }).then(function(modal) {
		  $rootScope.modal = modal;
	   });
		
	   $rootScope.openModal = function() {
		  $rootScope.formData = {};
		  $rootScope.modal.show();
	   };
	   
	   $rootScope.closeNewLifeStyleModal = function(){
			$rootScope.modal.hide();
	   }
		
	   $rootScope.recordLifeStyle = function() {
		  var headers = { 'Content-Type':'application/json' };
		  var measuresObj = {};
		  measuresObj[$rootScope.getOptionsSelectedTxt($rootScope.activitySelection, 'value', 'selected')] = $rootScope.formData.duration;
			var activityObj = { codeHN: userObj.codeHN, 
								updateDate: $filter('date')(today, "yyyy-MM-dd HH:mm"),
								measures: measuresObj
							  };
			console.log(activityObj);
			
			$http.post(URL_PREFIX+"/recordLifeStyleWS.do",JSON.stringify(activityObj),headers).
				success(function(data, status, headers, config) 
				{
					$ionicLoading.hide();
					$rootScope.modal.hide();
					$scope.loadData();
					
				}).
				error(function(data, status, headers, config) 
				{
					console.log("error"+JSON.stringify(data));
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: 'Please try again!',
						template: 'Error occurred during making appointment'
					});
				});
		  
	   };
		
	   //Cleanup the modal when we're done with it!
	   $rootScope.$on('$destroy', function() {
		  $rootScope.modal.remove();
	   });
		
	
	$rootScope.getOptionsSelectedTxt = function(options, valueProperty, selectedProperty){
		//console.log('getOptionsSelectedTxt'+JSON.stringify(options));
		if( typeof options != 'undefined' && options.length>0){
			var optionsSelected = $filter('filter')(options, function(option) {return option[selectedProperty] == true; });
			return optionsSelected.map(function(group){ return group[valueProperty]; }).join(", ");
		} else {
			return '';
		}
		
	};
	
	$scope.loadData();
})

.controller('DiagnosisCtrl', function($scope, $rootScope,$ionicNavBarDelegate, $stateParams,$ionicLoading, $http) {
	  $scope.$parent.showHeader();
	  $scope.$parent.clearFabs();
	  $scope.isExpanded = false;
	  $scope.$parent.setExpanded(false);
	  $scope.$parent.setHeaderFab(false);
	  $ionicNavBarDelegate.showBackButton(true);
	  
	  var userObj = JSON.parse(window.localStorage.getItem('user'));
	  var symptomList = JSON.parse(window.localStorage.getItem('symptomList'));
	  
	  console.log("symptomList:"+symptomList);
	  $scope.symptom = symptomList[$stateParams.sindex];
	  console.log("retrieving symptom "+JSON.stringify($scope.symptom));
	  $scope.symptom.testInfo = [];
	  var testInfoObj = JSON.parse($scope.symptom.testInformation);

	  for(var name in testInfoObj) {
		var value = testInfoObj[name];
		var isNumber = /^[0-9.]+$/.test(value);
		$scope.symptom.testInfo.push({'prop': name, 'value': value, 'isNumber': isNumber});
	  }
	  $scope.thresholdOptions = {
			   '0': {color: 'green'},
			  '40': {color: 'orange'},
			  '75.5': {color: 'red'}
		  };
	  $ionicLoading.show();
	  $http.get(URL_PREFIX+"/evaluateLifeStyleWS.do?codeHN="+userObj.codeHN+"&symptomID="+$scope.symptom.symptomKey)
		.then(function(res) 
		{
			console.log(res.data);
			$scope.lifeEvaluation = res.data;
			var goodPortion = Math.round(($scope.lifeEvaluation.distanceToBad / ($scope.lifeEvaluation.distanceToBad + $scope.lifeEvaluation.distanceToGood))*100);
			var badPortion = Math.round(($scope.lifeEvaluation.distanceToGood / ($scope.lifeEvaluation.distanceToBad + $scope.lifeEvaluation.distanceToGood))*100);
			
			$scope.lifestyleChartLabels = ["ผลเชิงบวก", "ผลเชิงลบ"];
			$scope.lifestyleChartData = [goodPortion, badPortion];
			$scope.lifestyleChartOptions = {legend: {display: true,position:'top'},scaleLabel: { fontColor: '#ffffff'}};
			
			$scope.lifeEvaluation.factor = [];
		    for(var name in $scope.lifeEvaluation.measureValues) {
				var value = $scope.lifeEvaluation.measureValues[name];
				$scope.lifeEvaluation.factor.push({'prop': name, 'value': value});
			}
			$ionicLoading.hide();
		}, function(err) {
				$ionicLoading.hide();
				console.error('ERR', JSON.stringify(err));
		}); 

})

.controller('ListSurveyFormCtrl', function($scope,$ionicHistory, $stateParams, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	$ionicLoading.show();
	$http.get(URL_PREFIX+"/listUnfilledFormWS.do?userId="+userObj.keyString)
		.then(function(res){ 
				$ionicLoading.hide();
				$scope.formList = res.data;
			
		}, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
		}); 
	
	$scope.renderForm = function(key) {
		console.log("renderForm: "+key);
	}
	
	
	
})

.controller('NewsAndPromotionCtrl', function($scope,$ionicHistory, $stateParams, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
	
	 // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	//$ionicHistory.clearHistory();
    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	var symptomObj = JSON.parse(window.localStorage.getItem('symptom'));
	$scope.news = [];
	$scope.promotion = [];
	$scope.urlprefix = URL_PREFIX;
	$ionicLoading.show();
	for(var i=0;i<symptomObj.length;i++){
		$http.get(URL_PREFIX+"/listNewsByTargetAndLevelWS.do?target="+symptomObj[i].symptomName+"&&level="+symptomObj[i].symptomlevel)
		.then(function(res){
			console.log(JSON.stringify(res.data));
			$scope.news = $scope.news.concat(res.data);
			$ionicLoading.hide();
		}
		, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
		});
	}
	
	for(var i=0;i<symptomObj.length;i++){
		$http.get(URL_PREFIX+"/listPromotionByTargetAndLevelWS.do?target="+symptomObj[i].symptomName+"&&level="+symptomObj[i].symptomlevel)
		.then(function(res){
			console.log(JSON.stringify(res.data));
			$scope.promotion = $scope.promotion.concat(res.data);
			$ionicLoading.hide();
		}
		, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
		});
	}
	
})

.controller('ListVoucherCtrl', function($scope,$ionicHistory, $stateParams, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk , $ionicPopup) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
	
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	
	$ionicLoading.show();
	$http.get(URL_PREFIX+"/getFilledFormByUserWS.do?userId="+userObj.keyString)
		.then(function(res){ 
				$ionicLoading.hide();
				$scope.fillformList = res.data;
		}, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
		});
	
	 $scope.openPopup = function(voucherCode) {

		    var customTemplate =
		    
		      '<label class="item item-input">  <img src="http://api.qrserver.com/v1/create-qr-code/?data='+voucherCode+'&size=200x200"></label>';

		    $ionicPopup.show({
		      template: customTemplate,
		      title: 'QR Code',
		     
		      buttons: [
		       {
		        text: '<b>Cancle</b>',
		        type: 'button-assertive',
		        onTap: function(e) {
		          
		        }
		      }]
		    });

		  }
	
	
	
	
})

.controller('NewsContentCtrl', function($scope,$ionicHistory, $stateParams, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
	var key = $stateParams.key;
	console.log('key: '+key);
	$http({
		method:'GET',
			url: URL_PREFIX+"/findNewsByKeyWS.do?key="+key,
			cache:true,
			headers : {
			'Content-Type' : 'application/json',
			'Accept' : 'application/json'
		}
	}).then(function (response){
		console.log('news'+JSON.stringify(response.data));
		$scope.news = response.data;
		$scope.urlprefix = URL_PREFIX;
	});
	
})

.controller('PromotionContentCtrl', function($scope,$ionicHistory, $stateParams, $http,$filter, $timeout, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
	var key = $stateParams.key;
	$http({
		method:'GET',
			url: URL_PREFIX+"/findPromotionByKeyWS.do?key="+key,
			cache:true,
			headers : {
			'Content-Type' : 'application/json',
			'Accept' : 'application/json'
		}
	}).then(function (response){
		console.log(response);
		$scope.promotion = response.data;
		$scope.urlprefix = URL_PREFIX;
	});

})

.controller('RenderSurveyFormCtrl', function($scope, $stateParams, $timeout, $state, $http,$filter,$ionicPopup, ionicMaterialMotion,$ionicLoading, ionicMaterialInk) {
	console.log("rendering form: ",$stateParams.formid);
	$scope.fillform = [];
	$http.get(URL_PREFIX+"/getSurveyFormWS.do?formid="+$stateParams.formid)
		.then(function(res){ 
				$ionicLoading.hide();
				if(Object.keys(res.data).length != 0){
					$scope.form = res.data;
					for(var i=0; i<$scope.form.questions.length; i++){
						$scope.fillform.push({questionId: $scope.form.questions[i].keyString, answerString: ""});
					}
				}
		}, function(err) {
				console.error('ERR', JSON.stringify(err));
				$ionicLoading.hide();
		}); 
		
	var userObj = JSON.parse(window.localStorage.getItem('user'));
	console.log("saving form for: "+JSON.stringify(userObj));
	$scope.submitForm = function() {
		$ionicLoading.show();
		console.log(JSON.stringify($scope.fillform));
		var passForm = {
					userId: userObj.keyString,
					formId: $stateParams.formid, 
					filledItem: $scope.fillform
					};
		var headers = { 'Content-Type':'application/json' };
		$http.post(URL_PREFIX+"/saveFilledFormWS.do",JSON.stringify(passForm),headers).
			success(function(data, status, headers, config) 
			{
				$ionicLoading.hide();
				$state.go("app.listsurveyform");
			}).
			error(function(data, status, headers, config) 
			{
				console.log("error: "+data);
				$ionicLoading.hide();
				
				
			});
	}
})



.directive('ionMultipleSelect', ['$ionicModal', '$ionicGesture', function ($ionicModal, $ionicGesture) {
  return {
    restrict: 'E',
    scope: {
      options : "=",
	  coptions : "="
    },
    controller: function ($scope, $element, $attrs, $ionicLoading) {
	console.log("chbx:"+$attrs.renderCheckbox+$attrs.keyProperty);
      $scope.multipleSelect = {
        title:            $attrs.title || "Select Options",
        tempOptions:      [],
        keyProperty:      $attrs.keyProperty || "id",
        valueProperty:    $attrs.valueProperty || "value",
        selectedProperty: $attrs.selectedProperty || "selected",
        templateUrl:      $attrs.templateUrl || 'templates/multipleSelect.html',
        renderCheckbox:   $attrs.renderCheckbox ? $attrs.renderCheckbox == "true" : true,
        animation:        $attrs.animation || 'none'//'slide-in-up'
      };
      $scope.OpenModalFromTemplate = function (templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope,
          animation: $scope.multipleSelect.animation
        }).then(function (modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      };
      
      $ionicGesture.on('tap', function (e) {
	   $ionicLoading.show();
       $scope.multipleSelect.tempOptions = $scope.options.map(function(option){
         var tempOption = { };
         tempOption[$scope.multipleSelect.keyProperty] = option[$scope.multipleSelect.keyProperty];
         tempOption[$scope.multipleSelect.valueProperty] = option[$scope.multipleSelect.valueProperty];
         tempOption[$scope.multipleSelect.selectedProperty] = option[$scope.multipleSelect.selectedProperty];
     
         return tempOption;
       });
	   $ionicLoading.hide();
        $scope.OpenModalFromTemplate($scope.multipleSelect.templateUrl);
      }, $element);
      
      $scope.saveOptions = function(){
	    if($scope.multipleSelect.renderCheckbox){
			for(var i = 0; i < $scope.multipleSelect.tempOptions.length; i++){
			  var tempOption = $scope.multipleSelect.tempOptions[i];
			  for(var j = 0; j < $scope.options.length; j++){
				var option = $scope.options[j];
				if(tempOption[$scope.multipleSelect.keyProperty] == option[$scope.multipleSelect.keyProperty]){
				  option[$scope.multipleSelect.selectedProperty] = tempOption[$scope.multipleSelect.selectedProperty];
				  break;
				}
			  }
			}
		} else {
			// for radio button

			for(var i = 0; i < $scope.options.length; i++){
				var option = $scope.options[i];
				if(option[$scope.multipleSelect.keyProperty] == $scope.selected){
					  option[$scope.multipleSelect.selectedProperty] = true;
				} else{
					  option[$scope.multipleSelect.selectedProperty] = false;
				}
			}
		   
		}
        $scope.closeModal();
      };
	  
	  $scope.onSelectRadio = function(u){
		console.log("onSelectRadio called: "+u);
		$scope.selected = u;
	  }	
      
      $scope.closeModal = function () {
        $scope.modal.remove();
      };
      $scope.$on('$destroy', function () {
          if ($scope.modal){
              $scope.modal.remove();
          }
      });
    }
  };
}])

;
