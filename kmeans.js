
var kmeans;
var timer;

$(document).ready(function () {
	kmeans = new KMeans();

	$('#reset').click(function () {
		kmeans.resetCanvas();
		clearTimeout(timer);
		$('#generateRandomSamples, #generateClusteredSamples').removeAttr('disabled');
		$('#initializeKMeans, #calculateAssignments, #updateMeans, #runKMeans').attr('disabled','disabled');
	});

	$('#generateRandomSamples').click(function () {
		kmeans.generateRandomSamples(parseInt($('#numRandomSamples').val()));
		$('#reset, #initializeKMeans').removeAttr('disabled');
		$('#calculateAssignments, #updateMeans, #runKMeans').attr('disabled','disabled');
	});

	$('#generateClusteredSamples').click(function () {
		kmeans.generateClusteredSamples(parseInt($('#numClusters').val()), parseInt($('#clusterSizeMin').val()), parseInt($('#clusterSizeMax').val()), parseInt($('#clusterRadiusMin').val()), parseInt($('#clusterRadiusMax').val()));
		$('#reset, #initializeKMeans').removeAttr('disabled');
		$('#calculateAssignments, #updateMeans, #runKMeans').attr('disabled','disabled');
	});

	$('#initializeKMeans').click(function () {
		kmeans.generateRandomMeans(parseInt($('#numMeans').val()));
		$('#calculateAssignments, #runKMeans').removeAttr('disabled');
	});

	$('#calculateAssignments').click(function () {
		kmeans.calculateAssignments();
		$('#updateMeans').removeAttr('disabled');
	});

	$('#updateMeans').click(function () {
		kmeans.updateMeans();
	});

	$('#runKMeans').click(function () {
		kmeans.startLoop(parseInt($('#runInterval').val()));
		$('#generateRandomSamples, #generateClusteredSamples, #initializeKMeans, #calculateAssignments, #updateMeans, #runKMeans').attr('disabled','disabled');
	});
});

function KMeans() {
	this.canvas = $('canvas')[0].getContext("2d");
	this.width = 600;
	this.height = 600;

	this.samples = [];
	this.means = [];
	this.assignments = [];

	this.generateRandomSamples = function(num) {
		this.samples = [];
		this.means = [];
		this.assignments = [];
		for (var i = 0; i < num; i++) {
			var x = getRandomInt(10, this.width - 10);
			var y = getRandomInt(10, this.height - 10);
			this.samples.push([x, y]);
		}

		this.refreshCanvas();
	}

	this.generateClusteredSamples = function(numClusters, minSize, maxSize, minRadius, maxRadius) {
		this.samples = [];
		this.means = [];
		this.assignments = [];
		for (var i = 0; i < numClusters; i++) {
			var clusterX = getRandomInt(maxRadius + 10, this.width - maxRadius - 10);
			var clusterY = getRandomInt(maxRadius + 10, this.height - maxRadius - 10);
			var clusterSize = getRandomInt(minSize, maxSize);
			var clusterRadius = getRandomInt(minRadius, maxRadius);

			for (var j = 0; j < clusterSize; j++) {
				var r = getRandomArbitary(0, clusterRadius);
				var theta = getRandomArbitary(0, 2 * Math.PI);

				var x = clusterX + r * Math.cos(theta);
				var y = clusterY + r * Math.sin(theta);
				this.samples.push([x, y]);
			}
		}

		this.refreshCanvas();
	}

	this.generateRandomMeans = function(num) {
		this.means = [];
		for (var i = 0; i < num; i++) {
			var x = getRandomInt(10, this.width - 10);
			var y = getRandomInt(10, this.height - 10);
			this.means.push([x, y]);
		}

		this.refreshCanvas();
	}

	this.calculateAssignments = function() {
		var means = this.means;
		var samples = this.samples;
		var assignments = this.assignments;

		$.each(samples, function (i, s) {
			var dists = $.map(means, function (m) {
				return Math.sqrt(Math.pow(s[0] - m[0], 2) + Math.pow(s[1] - m[1], 2));
			});
			assignments[i] = dists.indexOf(Math.min.apply(null, dists));
		});

		this.refreshCanvas();
	}

	this.updateMeans = function () {
		var means = this.means;
		var samples = this.samples;
		var assignments = this.assignments;

		$.each(means, function (i_mean, mean) {
			var cluster = $.grep(samples, function (sample, i_sample) {
				return (assignments[i_sample] == i_mean);
			});

			means[i_mean] = [0, 0];
			$.each(cluster, function (i, sample) {
				means[i_mean][0] += sample[0] / cluster.length;
				means[i_mean][1] += sample[1] / cluster.length;
			})
		});

		this.refreshCanvas();
	}

	this.startLoop = function (delay) {
		kmeans.calculateAssignments();
		timer = setTimeout(function () {
			kmeans.updateMeans();
			timer = setTimeout(function () {
				kmeans.startLoop(delay);
			}, delay);
		}, delay);
	}

	this.resetCanvas = function () {
		this.canvas.clearRect(0, 0, this.width, this.height);
	}

	this.refreshCanvas = function() {
		var canvas = this.canvas;
		var means = this.means;
		var samples = this.samples;

		// reset canvas
		this.resetCanvas();

		// draw samples
		$.each(samples, function (i, pt) {
			canvas.beginPath();
			canvas.arc(pt[0], pt[1], 3, 0, Math.PI*2, true);
			canvas.closePath();
			canvas.fill();
			canvas.strokeStyle = 'yellow';
			canvas.stroke();
		});

		// draw assignments
		$.each(this.assignments, function (sample_num, mean_num) {
			var mean = means[mean_num];
			var sample = samples[sample_num];

			canvas.beginPath();
			canvas.moveTo(mean[0], mean[1]);
			canvas.lineTo(sample[0], sample[1]);
			canvas.strokeStyle = 'magenta';
			canvas.stroke();
		})

		// draw means
		$.each(means, function (i, pt) {
			if (pt[0] != 0 && pt[1] != 0) {
				canvas.beginPath();
				canvas.arc(pt[0], pt[1], 4, 0, Math.PI*2, true);
				canvas.closePath();
				canvas.fill();
				canvas.strokeStyle = 'blue';
				canvas.stroke();
			}
		});
	}
}

function getRandomArbitary (min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
