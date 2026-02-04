<?php
/** 
 * @package     VikRentCar
 * @subpackage  core
 * @author      E4J s.r.l.
 * @copyright   Copyright (C) 2024 E4J s.r.l. All Rights Reserved.
 * @license     http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 * @link        https://vikwp.com
 */

// No direct access
defined('ABSPATH') or die('No script kiddies please!');

/**
 * VikRentCar pricing controller.
 *
 * @since 	1.15.5 (J) - 1.4.0 (WP)
 */
class VikRentCarControllerPricing extends JControllerAdmin
{
	public function setnewrates()
	{
		$dbo = JFactory::getDbo();

		$currencysymb = VikRentCar::getCurrencySymb();
		$vrc_df = VikRentCar::getDateFormat();
		$df = $vrc_df == "%d/%m/%Y" ? 'd/m/Y' : ($vrc_df == "%m/%d/%Y" ? 'm/d/Y' : 'Y/m/d');

		$pcheckinh = 0;
		$pcheckinm = 0;
		$pcheckouth = 0;
		$pcheckoutm = 0;
		$timeopst = VikRentCar::getTimeOpenStore();
		if (is_array($timeopst)) {
			$opent = VikRentCar::getHoursMinutes($timeopst[0]);
			$closet = VikRentCar::getHoursMinutes($timeopst[1]);
			$pcheckinh = $opent[0];
			$pcheckinm = $opent[1];
			// set drop off time equal to pick up time to avoid getting extra days of rent
			$pcheckouth = $pcheckinh;
			$pcheckoutm = $pcheckinm;
		}

		$pid_car = VikRequest::getInt('id_car', 0, 'request');
		$pid_price = VikRequest::getInt('id_price', 0, 'request');
		$prate = VikRequest::getString('rate', '', 'request');
		$prate = (float)$prate;
		$pfromdate = VikRequest::getString('fromdate', '', 'request');
		$ptodate = VikRequest::getString('todate', '', 'request');

		if (empty($pid_car) || empty($pid_price) || empty($prate) || !($prate > 0) || empty($pfromdate) || empty($ptodate)) {
			echo 'e4j.error.'.addslashes(JText::_('VRRATESOVWERRNEWRATE'));
			exit;
		}

		// read the rates for the lowest number of nights
		$q = "SELECT `r`.`id`,`r`.`idcar`,`r`.`days`,`r`.`idprice`,`r`.`cost`,`p`.`name` FROM `#__vikrentcar_dispcost` AS `r` INNER JOIN (SELECT MIN(`days`) AS `min_days` FROM `#__vikrentcar_dispcost` WHERE `idcar`=".(int)$pid_car." AND `idprice`=".(int)$pid_price." GROUP BY `idcar`) AS `r2` ON `r`.`days`=`r2`.`min_days` LEFT JOIN `#__vikrentcar_prices` `p` ON `p`.`id`=`r`.`idprice` AND `p`.`id`=".(int)$pid_price." WHERE `r`.`idcar`=".(int)$pid_car." AND `r`.`idprice`=".(int)$pid_price." GROUP BY `r`.`id`,`r`.`idcar`,`r`.`days`,`r`.`idprice`,`r`.`cost`,`p`.`name` ORDER BY `r`.`days` ASC, `r`.`cost` ASC;";
		$dbo->setQuery($q);
		$carrates = $dbo->loadAssocList();
		foreach ($carrates as $rrk => $rrv) {
			$carrates[$rrk]['cost'] = round(($rrv['cost'] / $rrv['days']), 2);
			$carrates[$rrk]['days'] = 1;
		}

		if (!$carrates) {
			echo 'e4j.error.'.addslashes(JText::_('VRRATESOVWERRNORATES'));
			exit;
		}

		$carrates = $carrates[0];
		$current_rates = array();
		$start_ts = strtotime($pfromdate);
		$end_ts = strtotime($ptodate);
		$infostart = getdate($start_ts);
		while ($infostart[0] > 0 && $infostart[0] <= $end_ts) {
			$today_tsin = VikRentCar::getDateTimestamp(date($df, $infostart[0]), $pcheckinh, $pcheckinm);
			$today_tsout = VikRentCar::getDateTimestamp(date($df, mktime(0, 0, 0, $infostart['mon'], ($infostart['mday'] + 1), $infostart['year'])), $pcheckouth, $pcheckoutm);

			$tars = VikRentCar::applySeasonsCar(array($carrates), $today_tsin, $today_tsout);
			$current_rates[(date('Y-m-d', $infostart[0]))] = $tars[0];

			$infostart = getdate(mktime(0, 0, 0, $infostart['mon'], ($infostart['mday'] + 1), $infostart['year']));
		}

		if (!$current_rates) {
			echo 'e4j.error.'.addslashes(JText::_('VRRATESOVWERRNORATES').'.');
			exit;
		}

		$all_days = array_keys($current_rates);
		$season_intervals = array();
		$firstind = 0;
		$firstdaycost = $current_rates[$all_days[0]]['cost'];
		$nextdaycost = false;
		for ($i = 1; $i < count($all_days); $i++) {
			$ind = $all_days[$i];
			$nextdaycost = $current_rates[$ind]['cost'];
			if ($firstdaycost != $nextdaycost) {
				$interval = array(
					'from' => $all_days[$firstind],
					'to' => $all_days[($i - 1)],
					'cost' => $firstdaycost
				);
				$season_intervals[] = $interval;
				$firstdaycost = $nextdaycost;
				$firstind = $i;
			}
		}
		if ($nextdaycost === false) {
			$interval = array(
				'from' => $all_days[$firstind],
				'to' => $all_days[$firstind],
				'cost' => $firstdaycost
			);
			$season_intervals[] = $interval;
		} elseif ($firstdaycost == $nextdaycost) {
			$interval = array(
				'from' => $all_days[$firstind],
				'to' => $all_days[($i - 1)],
				'cost' => $firstdaycost
			);
			$season_intervals[] = $interval;
		}
		foreach ($season_intervals as $sik => $siv) {
			if ((float)$siv['cost'] == $prate) {
				unset($season_intervals[$sik]);
			}
		}

		if (!$season_intervals) {
			echo 'e4j.error.'.addslashes(JText::_('VRRATESOVWERRNORATESMOD'));
			exit;
		}

		foreach ($season_intervals as $sik => $siv) {
			$first = strtotime($siv['from']);
			$second = strtotime($siv['to']);
			if ($second > 0 && $second == $first) {
				$second += 86399;
			}
			if (!($second > $first)) {
				unset($season_intervals[$sik]);
				continue;
			}
			$baseone = getdate($first);
			$basets = mktime(0, 0, 0, 1, 1, $baseone['year']);
			$sfrom = $baseone[0] - $basets;
			$basetwo = getdate($second);
			$basets = mktime(0, 0, 0, 1, 1, $basetwo['year']);
			$sto = $basetwo[0] - $basets;
			//check leap year
			if ($baseone['year'] % 4 == 0 && ($baseone['year'] % 100 != 0 || $baseone['year'] % 400 == 0)) {
				$leapts = mktime(0, 0, 0, 2, 29, $baseone['year']);
				if ($baseone[0] > $leapts) {
					$sfrom -= 86400;
					/**
					 * To avoid issue with leap years and dates near Feb 29th, we only reduce the seconds if these were reduced
					 * for the from-date of the seasons. Doing it just for the to-date in 2019 for 2020 (leap) produced invalid results.
					 * 
					 * @since 	July 2nd 2019
					 */
					if ($basetwo['year'] % 4 == 0 && ($basetwo['year'] % 100 != 0 || $basetwo['year'] % 400 == 0)) {
						$leapts = mktime(0, 0, 0, 2, 29, $basetwo['year']);
						if ($basetwo[0] > $leapts) {
							$sto -= date('d-m', $baseone[0]) != '31-12' && date('d-m', $basetwo[0]) == '31-12' ? 1 : 86400;
						}
					}
				}
			}
			//end leap year
			$tieyear = $baseone['year'];
			$ptype = (float)$siv['cost'] > $prate ? "2" : "1";
			$pdiffcost = $ptype == "1" ? ($prate - (float)$siv['cost']) : ((float)$siv['cost'] - $prate);
			$roomstr = "-".$pid_car."-,";
			$pspname = date('Y-m-d H:i').' - '.substr($baseone['month'], 0, 3).' '.$baseone['mday'].($siv['from'] != $siv['to'] ? '/'.($baseone['month'] != $basetwo['month'] ? substr($basetwo['month'], 0, 3).' ' : '').$basetwo['mday'] : '');
			$pval_pcent = 1;
			$pricestr = "-".$pid_price."-,";
			$q = "INSERT INTO `#__vikrentcar_seasons` (`type`,`from`,`to`,`diffcost`,`idcars`,`spname`,`wdays`,`pickupincl`,`val_pcent`,`losoverride`,`roundmode`,`year`,`idprices`,`promo`,`promotxt`,`promodaysadv`) VALUES('".($ptype == "1" ? "1" : "2")."', ".$dbo->quote($sfrom).", ".$dbo->quote($sto).", ".$dbo->quote($pdiffcost).", ".$dbo->quote($roomstr).", ".$dbo->quote($pspname).", '', '0', '".$pval_pcent."', '', NULL, ".$tieyear.", ".$dbo->quote($pricestr).", 0, '', NULL);";
			$dbo->setQuery($q);
			$dbo->execute();
		}
		//prepare output by re-calculating the rates in real-time
		$current_rates = array();
		$start_ts = strtotime($pfromdate);
		$end_ts = strtotime($ptodate);
		$infostart = getdate($start_ts);
		while ($infostart[0] > 0 && $infostart[0] <= $end_ts) {
			$today_tsin = VikRentCar::getDateTimestamp(date($df, $infostart[0]), $pcheckinh, $pcheckinm);
			$today_tsout = VikRentCar::getDateTimestamp(date($df, mktime(0, 0, 0, $infostart['mon'], ($infostart['mday'] + 1), $infostart['year'])), $pcheckouth, $pcheckoutm);

			$tars = VikRentCar::applySeasonsCar(array($carrates), $today_tsin, $today_tsout);
			$indkey = $infostart['mday'].'-'.$infostart['mon'].'-'.$infostart['year'].'-'.$pid_price;
			$current_rates[$indkey] = $tars[0];

			$infostart = getdate(mktime(0, 0, 0, $infostart['mon'], ($infostart['mday'] + 1), $infostart['year']));
		}
		
		$pdebug = VikRequest::getInt('e4j_debug', 0, 'request');
		if ($pdebug == 1) {
			echo "e4j.error.\n".print_r($carrates, true)."\n";
			echo print_r($current_rates, true)."\n\n";
			echo print_r($season_intervals, true)."\n";
			echo $pid_car.' - '.$pid_price.' - '.$prate.' - '.$pfromdate.' - '.$ptodate."\n";
		}
		echo json_encode($current_rates);
		exit;
	}
}
