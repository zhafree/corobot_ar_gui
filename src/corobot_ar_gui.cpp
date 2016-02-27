/**
 *  Author: Qiyun Sun
 *  Email: qs6386@cs.rit.edu
 */

#include "ros/ros.h"
#include <iostream>

using namespace std;

int main(int argc, char **argv) {
        ros::init(argc, argv, "corobot_ar_gui");

        if ( argc != 3 ) {
                ROS_INFO("Usage: rosrun corobot_ar_gui corobot_ar_gui EXECUTABLE_PATH SCRIPT_PATH");
                return 1;
        } else {
                std::stringstream ss;
                ss << argv[1] << " " << argv[2];
                if (system(ss.str().c_str())) {}
        }

        return 0;
}
