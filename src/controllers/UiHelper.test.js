import { LocalFindStopData } from './UiHelper';
import { LocalFindStopData_input } from './test_objects/UiHelper_testobj.js';

jest.mock('../services/Constants');
// jest.mock('./UiHelper');
test('LocalFindStopData should return data for a specific stop', () => {
  const expectedOutput = {
    stop_id: 2,
    stop_name: 'Prepare for license ',
    stop_activities: [
      {
        act_id: 7,
        act_name: '45 hours behind-the-wheel practice',
        act_description: 'Can be done without instructor',
        act_ending_event: '45 hours behind-the-wheel practice',
        act_starting_event: 'Get permit',
        act_path_type: 'Concurrent',
        act_meta_data: [],
        act_it_assets: 'N/A',
        attributes: {
          tester2: '1',
          tester5: '3',
          tester4: '2',
          'IT Assets': 'gfsgs',
        },
      },
      {
        act_id: 8,
        act_name: 'Drivers education course',
        act_description: 'Done in person or online',
        act_ending_event: 'Drivers education course',
        act_starting_event: 'Get permit',
        act_path_type: 'Concurrent',
        act_meta_data: [],
        act_it_assets: 'N/A',
        attributes: {
          tester2: '1',
          tester5: '3',
          tester4: '2',
          'IT Assets': 'asdafa',
        },
      },
      {
        act_id: 9,
        act_name: 'Hold permit for at least 9 months',
        act_description: 'Since passed permit test',
        act_ending_event: 'Hold permit for at least 9 months',
        act_starting_event: 'Get permit',
        act_path_type: 'Concurrent',
        act_meta_data: [],
        act_it_assets: 'N/A',
        attributes: {
          tester2: '1',
          tester5: '3',
          tester4: '2',
          'IT Assets': 'hrteh',
        },
      },
      {
        act_id: 10,
        act_name: '16 years and 3 months of age',
        act_description: '',
        act_ending_event: '16 years and 3 months of age',
        act_starting_event: 'Get permit',
        act_path_type: 'Concurrent',
        act_meta_data: [],
        act_it_assets: 'N/A',
        attributes: {
          tester2: '1',
          tester5: '3',
          tester4: '2',
          'IT Assets': 'fccb',
        },
      },
    ],
    cx: 255.5908966064453,
    cy: 80,
    descendant_stop_id: [3],
    stop_styles: {
      stop_has_line: 'yes ',
      stop_label_position: 'up',
    },
    starting_event: 'Get permit',
    ending_event: 'Ready for road test',
    stop_definition: 'Steps taken before exam',
    sector_id: 1,
    is_beginning_stop: false,
    color: '#FCB941',
    phase_name: 'License',
    phase_id: 2,
  };
  expect(LocalFindStopData(2, LocalFindStopData_input)).toEqual(expectedOutput);
});
