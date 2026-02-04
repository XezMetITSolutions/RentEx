<?php
/**
 * @package     VikRentCar
 * @subpackage  com_vikrentcar
 * @author      Alessio Gaggii - e4j - Extensionsforjoomla.com
 * @copyright   Copyright (C) 2018 e4j - Extensionsforjoomla.com. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 * @link        https://vikwp.com
 */

defined('ABSPATH') or die('No script kiddies please!');

// import Joomla view library
jimport('joomla.application.component.view');

class VikRentCarViewPmsreports extends JViewVikRentCar
{
	public function display($tpl = null)
	{
		// Set the toolbar
		$this->addToolBar();

		/**
		 * @wponly - trigger back up of extendable files
		 * 
		 * This code can also be kept in Joomla as it won't be executed.
		 */
		if (VRCPlatformDetection::isWordPress()) {
			VikRentCarLoader::import('update.manager');
			VikRentCarUpdateManager::triggerExtendableClassesBackup('report');
		}

		$dbo = JFactory::getDbo();

		$report_objs = array();
		$country_objs = array();
		$countries = array();
		
		$report_base = VRC_ADMIN_PATH . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'report' . DIRECTORY_SEPARATOR;
		require_once $report_base . 'report.php';

		$report_files = glob($report_base.'*.php');

		/**
		 * Trigger event to let other plugins register additional driver full paths.
		 *
		 * @since 	1.15.5 (J) - 1.4.0 (WP)
		 */
		$list = VRCFactory::getPlatform()->getDispatcher()->filter('onLoadPmsReports');
		foreach ($list as $chunk) {
			// merge default driver files with the returned ones
			$report_files = array_merge($report_files, (array)$chunk);
		}

		foreach ($report_files as $k => $report_path) {
			// driver file name
			$report_file = basename($report_path, '.php');

			if ($report_file == 'report.php') {
				// exclude protected abstract report class
				unset($report_files[$k]);
				continue;
			}

			// load report file
			require_once $report_path;

			// build report class name
			$classname = 'VikRentCarReport'.str_replace(' ', '', ucwords(str_replace('.php', '', str_replace('_', ' ', $report_file))));
			if (!class_exists($classname)) {
				// invalid class name declared
				unset($report_files[$k]);
				continue;
			}

			if ($report_file == 'revenue.php' && $report_objs) {
				// make the "revenue.php" the first element of the list
				array_unshift($report_objs, new $classname);
			} elseif (substr($report_file, 2, 1) == '_') {
				// this is probably a country specific report so we push it to a separate array (two-letter country code + underscore in file name)
				$country_key = strtoupper(substr($report_file, 0, 2));
				if (!isset($country_objs[$country_key])) {
					$country_objs[$country_key] = array();
				}
				array_push($country_objs[$country_key], new $classname);
			} else {
				// push this object as a global report
				array_push($report_objs, new $classname);
			}
		}

		// get countries information for the reports
		$country_keys = array_keys($country_objs);
		if ($country_keys) {
			$country_keys = array_map(array($dbo, 'quote'), $country_keys);
			$q = "SELECT `country_name`,`country_2_code` FROM `#__vikrentcar_countries` WHERE `country_2_code` IN (".implode(', ', $country_keys).");";
			$dbo->setQuery($q);
			$cdata = $dbo->loadAssocList();
			if ($cdata) {
				foreach ($cdata as $cd) {
					$countries[$cd['country_2_code']] = $cd['country_name'];
				}
			}
		}

		// check whether some country specific reports truly belong to a country
		foreach ($country_objs as $ckey => $cvalue) {
			if (!isset($countries[$ckey])) {
				// this country does not exist, so maybe the report file was given a short beginning name. Push it to the global reports array
				unset($countries[$ckey]);
				$report_objs = array_merge($report_objs, $cvalue);
			}
		}
		
		$this->report_objs = $report_objs;
		$this->country_objs = $country_objs;
		$this->countries = $countries;
		
		// Display the template
		parent::display($tpl);
	}

	/**
	 * Sets the toolbar
	 */
	protected function addToolBar()
	{
		JToolBarHelper::title(JText::_('VRCMAINPMSREPORTSTITLE'), 'vikrentcar');
		JToolBarHelper::cancel( 'canceldash', JText::_('VRBACK'));
		JToolBarHelper::spacer();
	}
}
