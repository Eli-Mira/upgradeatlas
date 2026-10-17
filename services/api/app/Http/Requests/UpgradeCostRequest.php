<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpgradeCostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Decimal strings preserve piasters without JSON floating-point ambiguity.
        $money = ['bail', 'required', 'string', 'max:10', 'regex:/\A(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,2})?\z/'];

        return array_fill_keys([
            'ram_cost_egp', 'ssd_cost_egp', 'installation_cost_egp', 'replacement_cost_egp',
        ], $money);
    }
}
