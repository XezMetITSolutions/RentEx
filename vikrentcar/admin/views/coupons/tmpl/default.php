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

$app = JFactory::getApplication();
$pcode = $app->getUserStateFromRequest("vrc.coupons.code", 'code', '', 'string');

$rows = $this->rows;
$lim0 = $this->lim0;
$navbut = $this->navbut;

?>
<div class="vrc-list-form-filters vrc-btn-toolbar">
	<form action="index.php?option=com_vikrentcar&amp;task=coupons" method="post" name="couponsform">
		<div style="width: 100%; display: inline-block;" class="btn-toolbar" id="filter-bar">
			<div class="btn-group pull-left input-append">
				<input type="text" name="code" id="code" value="<?php echo $pcode; ?>" size="40" placeholder="<?php echo htmlspecialchars(JText::_('VRCPVIEWCOUPONSONE')); ?>"/>
				<button type="button" class="btn btn-secondary" onclick="document.couponsform.submit();"><i class="icon-search"></i></button>
			</div>
			<div class="btn-group pull-left">
				<button type="button" class="btn btn-secondary" onclick="document.getElementById('code').value='';document.couponsform.submit();"><?php echo JText::_('JSEARCH_FILTER_CLEAR'); ?></button>
			</div>
		</div>
		<input type="hidden" name="task" value="coupons" />
		<input type="hidden" name="option" value="com_vikrentcar" />
	</form>
</div>
<?php

if (empty($rows)) {
	?>
	<p class="warn"><?php echo JText::_('VRCNOCOUPONSFOUND'); ?></p>
	<form action="index.php?option=com_vikrentcar" method="post" name="adminForm" id="adminForm">
		<input type="hidden" name="task" value="" />
		<input type="hidden" name="option" value="com_vikrentcar" />
	</form>
	<?php
} else {
	?>
<a class="vrc-coupon-basenavuri" href="index.php?option=com_vikrentcar&task=orders&filtnc=coupon:%s" style="display: none;"></a>

<form action="index.php?option=com_vikrentcar" method="post" name="adminForm" id="adminForm" class="vrc-list-form">
	<div class="table-responsive">
		<table cellpadding="4" cellspacing="0" border="0" width="100%" class="table table-striped vrc-list-table">
			<thead>
				<tr>
					<th width="20">
						<input type="checkbox" onclick="Joomla.checkAll(this)" value="" name="checkall-toggle">
					</th>
					<th class="title left" width="200"><?php echo JText::_( 'VRCPVIEWCOUPONSONE' ); ?></th>
					<th class="title center" width="200"><?php echo JText::_( 'VRCPVIEWCOUPONSTWO' ); ?></th>
					<th class="title center" width="100"><?php echo JText::_( 'VRCPVIEWCOUPONSTHREE' ); ?></th>
					<th class="title center" width="100"><?php echo JText::_( 'VRCPVIEWCOUPONSFOUR' ); ?></th>
					<th class="title center" width="100"><?php echo JText::_( 'VRCPVIEWCOUPONSFIVE' ); ?></th>
					<th class="title center" width="100"><?php echo JText::_( 'VRC_NUMBER_USES' ); ?></th>
				</tr>
			</thead>
	<?php
	$currencysymb = VikRentCar::getCurrencySymb(true);
	$nowdf = VikRentCar::getDateFormat(true);
	if ($nowdf == "%d/%m/%Y") {
		$df = 'd/m/Y';
	} elseif ($nowdf == "%m/%d/%Y") {
		$df = 'm/d/Y';
	} else {
		$df = 'Y/m/d';
	}
	$k = 0;
	$i = 0;
	for ($i = 0, $n = count($rows); $i < $n; $i++) {
		$row = $rows[$i];
		$strtype = $row['type'] == 1 ? JText::_('VRCCOUPONTYPEPERMANENT') : JText::_('VRCCOUPONTYPEGIFT');
		$strtype .= ", ".$row['value']." ".($row['percentot'] == 1 ? "%" : $currencysymb);
		$strdate = JText::_('VRCCOUPONALWAYSVALID');
		if (strlen($row['datevalid']) > 0) {
			$dparts = explode("-", $row['datevalid']);
			$strdate = date($df, $dparts[0])." - ".date($df, $dparts[1]);
		}
		$totvehicles = 0;
		if (intval($row['allvehicles']) == 0) {
			$allve = explode(";", $row['idcars']);
			foreach ($allve as $fv) {
				if (!empty($fv)) {
					$totvehicles++;
				} 
			}
		}
		?>
		<tr class="row<?php echo $k; ?>">
			<td><input type="checkbox" id="cb<?php echo $i;?>" name="cid[]" value="<?php echo (int)$row['id']; ?>" onclick="Joomla.isChecked(this.checked);"></td>
			<td class="vrc-highlighted-td" data-couponcode="<?php echo htmlspecialchars($row['code']); ?>"><a href="index.php?option=com_vikrentcar&amp;task=editcoupon&amp;cid[]=<?php echo (int)$row['id']; ?>"><?php echo $row['code']; ?></a></td>
			<td class="center"><?php echo $strtype; ?></td>
			<td class="center"><?php echo $strdate; ?></td>
			<td class="center"><?php echo intval($row['allvehicles']) == 1 ? JText::_('VRCCOUPONALLVEHICLES') : $totvehicles; ?></td>
			<td class="center"><?php echo $row['mintotord'] . ($row['maxtotord'] > 0 ? " - {$row['maxtotord']}" : ''); ?></td>
			<td class="center vrc-coupon-use-count"><?php VikRentCarIcons::e('circle-notch', 'fa-spin fa-fw'); ?></td>
		</tr>
		<?php
		$k = 1 - $k;
	}
	?>

		</table>
	</div>
	<input type="hidden" name="option" value="com_vikrentcar" />
	<input type="hidden" name="task" value="coupons" />
	<input type="hidden" name="boxchecked" value="0" />
	<?php echo JHtml::_( 'form.token' ); ?>
	<?php echo $navbut; ?>
</form>

<script type="text/javascript">
	jQuery(function() {
		// collect all coupon codes
		var coupon_codes = [];
		jQuery('.vrc-highlighted-td').each(function() {
			coupon_codes.push(jQuery(this).attr('data-couponcode'));
		});

		// make the request
		VRCCore.doAjax(
			"<?php echo VikRentCar::ajaxUrl('index.php?option=com_vikrentcar&task=orders.coupons_use_count'); ?>",
			{
				coupon_codes: coupon_codes,
				tmpl: "component"
			},
			function(response) {
				var book_base_nav_uri = jQuery('.vrc-coupon-basenavuri').attr('href');
				try {
					var obj_res = typeof response === 'string' ? JSON.parse(response) : response;
					if (!obj_res) {
						console.error('Unexpected JSON response', obj_res);
						return false;
					}

					for (let i = 0; i < obj_res.length; i++) {
						let use_count = '0';
						if (obj_res[i]['count'] > 0) {
							use_count = '<a href="' + book_base_nav_uri.replace('%s', obj_res[i]['code']) + '" target="_blank">' + obj_res[i]['count'] + '</a>';
						}
						jQuery('.vrc-highlighted-td[data-couponcode="' + obj_res[i]['code'] + '"]').parent('tr').find('td.vrc-coupon-use-count').html(use_count);
					}
				} catch(err) {
					jQuery('.vrc-coupon-use-count').text('---');
					console.error('could not parse JSON response', err, response);
				}
			},
			function(error) {
				jQuery('.vrc-coupon-use-count').text('---');
				console.error(error);
			}
		);
	});
</script>
<?php
}
