<?php
/** 
 * @package     VikRentCar - Libraries
 * @subpackage  html.license
 * @author      E4J s.r.l.
 * @copyright   Copyright (C) 2024 E4J s.r.l. All Rights Reserved.
 * @license     http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
 * @link        https://vikwp.com
 */

// No direct access
defined('ABSPATH') or die('No script kiddies please!');

$view = $displayData['view'];

$lookup = [
	'coupons' => [
		'title' => JText::_('VRCMENUCOUPONS'),
		'desc'  => JText::_('VRCFREECOUPONSDESCR'),
	],
	'crons' => [
		'title' => JText::_('VRCMENUCRONS'),
		'desc'  => JText::_('VRCFREECRONSDESCR'),
	],
	'customers' => [
		'title' => JText::_('VRCMENUCUSTOMERS'),
		'desc'  => JText::_('VRCFREECUSTOMERSDESCR'),
	],
	'optionals' => [
		'title' => JText::_('VRMENUTENFIVE'),
		'desc'  => JText::_('VRCFREEOPTIONSDESCR'),
	],
	'payments' => [
		'title' => JText::_('VRMENUTENEIGHT'),
		'desc'  => JText::_('VRCFREEPAYMENTSDESCR'),
	],
	'pmsreports' => [
		'title' => JText::_('VRCMENUPMSREPORTS'),
		'desc'  => JText::_('VRCFREEREPORTSDESCR'),
	],
	'restrictions' => [
		'title' => JText::_('VRMENURESTRICTIONS'),
		'desc'  => JText::_('VRCFREERESTRSDESCR'),
	],
	'seasons' => [
		'title' => JText::_('VRMENUTENSEVEN'),
		'desc'  => JText::_('VRCFREESEASONSDESCR'),
	],
	'graphs' => [
		'title' => JText::_('VRMENUGRAPHS'),
		'desc'  => JText::_('VRCFREESTATSDESCR'),
	],
	'locfees' => [
		'title' => JText::_('VRMENUTENSIX'),
		'desc'  => JText::_('VRCFREELOCFEESDESCR'),
	],
	'oohfees' => [
		'title' => JText::_('VRCMENUOOHFEES'),
		'desc'  => JText::_('VRCFREEOOHFEESDESCR'),
	],
];

if (!isset($lookup[$view]))
{
	return;
}

// set up toolbar title
JToolbarHelper::title('VikRentCar - ' . $lookup[$view]['title']);

if (empty($lookup[$view]['image']))
{
	// use the default logo image
	$lookup[$view]['image'] = 'vikwp_free_logo.png';
}

?>

<div class="vrc-free-nonavail-wrap">

	<div class="vrc-free-nonavail-inner">

		<div class="vrc-free-nonavail-logo">
			<img src="<?php echo VRC_SITE_URI . 'resources/' . $lookup[$view]['image']; ?>" />
		</div>

		<div class="vrc-free-nonavail-expl">
			<h3><?php echo $lookup[$view]['title']; ?></h3>

			<p class="vrc-free-nonavail-descr"><?php echo $lookup[$view]['desc']; ?></p>
			
			<p class="vrc-free-nonavail-footer-descr">
				<a href="admin.php?option=com_vikrentcar&amp;view=gotopro" class="btn vrc-free-nonavail-gopro">
					<?php VikRentCarIcons::e('rocket'); ?> <span><?php echo JText::_('VRCGOTOPROBTN'); ?></span>
				</a>
			</p>
		</div>

	</div>

</div>