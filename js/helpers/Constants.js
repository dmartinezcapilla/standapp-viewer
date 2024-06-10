var credentials = { server: "", user: "", password: "" };

var g_dev_users = [];
var g_qa_users = [];
IL: var g_issuetype_map = {
    user_story: {
        1: "Bug",
        10200: "Spike",
        3: "Task",
        10001: "Story",
        10403: "Integration",
        10601: "Systems Doc",
        10600: "Systems Test",
        10401: "Doc",
        10100: "Hardware Failure",
    },
    task: { 5: "Sub-task", 10800: "Review", 10500: "Finding" },
};

// SNOW
// var g_issuetype_map =  {user_story: {"9": "us", "10302" : "offsprint_us"}, task: {"12": "qa", "5": "dev", "10402": "at", "10303": "offsprint_task"}};
var g_evaluatedUser = "none";

var g_status_map = {
    1: "todo",
    3: "progress",
    10001: "done",
    10704: "done",
    10600: "progress",
    10601: "progress",
    10602: "progress",
    10401: "progress",
    10000: "todo",
    10500: "test",
    10300: "progress",
    10400: "progress",
    10603: "progress",
};
var g_estimate_field = "customfield_10003";

//DATA CONFIG PIE
let g_seconds_per_user = 60;
let elapsed_seconds = 0;
let chart_is_running = false;
const max_seconds_in_chart = g_seconds_per_user * 10;
const data_chart_js = {
    datasets: [{
        data: [max_seconds_in_chart, 0], // 60 seconds remaining, 0 seconds elapsed initially
        backgroundColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)'
        ],
        hoverOffset: 4
    }]
};

// Configuration for the pie chart
const config_chart_js = {
    type: 'doughnut',
    data: data_chart_js,
    options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '90%', // Adjust the size of the center hole
        plugins: {
            datalabels: {
                display: false,
            },
            legend: {
                display: false // Hide legend
            },
            tooltip: {
                enabled: false // Disable tooltips
            },
            hover: {
                mode: null // Disable hover effects
            },
        }
    },
};

const options_story_work_chart = {
    plugins: {
        datalabels: {
            display: function(context) {
                return context.dataset.data[context.dataIndex] > 0;
            },
            formatter: function(value, context) {
                return value + 'h';
            },
            color: 'white',
            font: {
                weight: 'bold',
                size: 16,
            },
        },
        legend: {
            display: false
        },
        tooltip: {
            enabled: false // Disable tooltips
        },
        hover: {
            mode: null // Disable hover effects
        },
    },
};

let chart_element;

var g_master = {
    key: "username_master",
    avatarUrls: {
        "48x48": "img/master.png",
    },
    displayName: "Master",
};

var initializeConfig = initializeConfig || [];
initializeConfig.push("login");
initializeConfig.push("board");
initializeConfig.push("sprint");
initializeConfig.push("issue");
