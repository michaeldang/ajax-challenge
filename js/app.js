"use strict";
/*
 app.js, main Angular application script
 define your module and controllers here
 */

//this is the base URL for all comment objects managed by your application
//requesting this with a GET will get all comments objects
//sending a POST to this will insert a new comment object
//sending a PUT to this URL + '/' + comment.objectId will update an existing comment
//sending a DELETE to this URL + '/' + comment.objectId will delete an existing comment
var commentsUrl = 'https://api.parse.com/1/classes/comments';

angular.module('CommentApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        //Parse required two extra headers sent with every HTTP request: X-Parse-Application-Id, X-Parse-REST-API-Key
        //the first needs to be set to your application's ID value
        //the second needs to be set to your application's REST API key
        //both of these are generated by Parse when you create your application via their web site
        //the following lines will add these as default headers so that they are sent with every
        //HTTP request we make in this application
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'PkNG634C77XcJnv8LeJwzfnIaeTuktjMU3mCg4up';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'z5o47r0mc1T51oaGNdj2wVGw8ESNHJmopgREvn74';
    })
    .controller('CommentsController', function($scope, $http) {
        $scope.refreshComments = function() {
            $http.get(commentsUrl)
                .success(function (data) {
                    $scope.comments = data.results;
                    $scope.comments.sort($scope.compareForSort);
                });
        };
        $scope.refreshComments();

        $scope.compareForSort = function(first, second)
        {
            if (first.votes == second.votes)
                return 0;
            if (first.votes < second.votes)
                return 1;
            else
                return -1;
        }

        $scope.addComment = function() {
            $scope.inserting = true;
            $http.post(commentsUrl, $scope.newComment)
                .success(function(responseData) {
                    $scope.newComment.objectId = responseData.objectId;
                    $scope.comments.push($scope.newComment);
                    $scope.incrementVotes($scope.newComment, 0);
                    $scope.newComment = {};
                })
                .finally(function () {
                    $scope.inserting = false;
                });
        };

        $scope.deleteComment = function(comment) {
            $http.delete(commentsUrl + '/' + comment.objectId, comment)
                .finally(function() {
                    $scope.refreshComments();
                });
        };

        $scope.incrementVotes = function(comment, amount) {
            if (!(comment.votes == 0 && amount < 0)) {
                var postData = {
                    votes: {
                        __op: "Increment",
                        amount: amount
                    }
                };
                $scope.updating = true;
                $http.put(commentsUrl + '/' + comment.objectId, postData)
                    .success(function(respData) {
                        comment.votes = respData.votes;
                    })
                    .error(function(err) {
                        console.log(err);
                    })
                    .   finally(function() {
                        $scope.updating = false;
                    });
            }
        };
    });