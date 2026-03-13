import React, { useState } from 'react';
import { useForm} from 'react-hook-form';
import type{ SubmitHandler } from 'react-hook-form';
import { Button } from '@base-ui/react';
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { cn } from '../lib/utils';
import type{ LeaveType, LeaveFormProps } from '../Types/index';

interface LeaveFormInputs {
  leaveType: LeaveType;
  reason?: string;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );
  
  const { register, handleSubmit, setValue } = useForm<LeaveFormInputs>({
    defaultValues: {
      leaveType: initialData?.leaveType,
      reason: initialData?.reason,
    }
  });

  const leaveTypes: LeaveType[] = ['Casual', 'Sick', 'Paid'];

  const onFormSubmit: SubmitHandler<LeaveFormInputs> = (data) => {
    if (!startDate || !endDate) {
      return;
    }
    onSubmit({
      ...data,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="leaveType">Leave Type</Label>
        <Select
  onValueChange={(value) => {
    if (value) setValue("leaveType", value as LeaveType);
  }}
  defaultValue={initialData?.leaveType}
>
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {leaveTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type} Leave
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger>
              <Button
               
                className=
                {cn(
                  "w-full justify-start text-left font-normal",
                  
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger>
              <Button
               
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date < (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason (Optional)</Label>
        <Input
          id="reason"
          {...register('reason')}
          placeholder="Enter reason for leave"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" className="border border-gray-300" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit Request</Button>
      </div>
    </form>
  );
};

export default LeaveForm;